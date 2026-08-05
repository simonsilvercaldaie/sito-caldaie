/**
 * Access Control — Centralized access management for video courses
 * 
 * Maps product_code → access levels and provides helpers to grant/check access.
 * This is the SINGLE SOURCE OF TRUTH for the product→level mapping.
 */

import { createClient } from '@supabase/supabase-js'
import { courses } from './coursesData'
import { EXEMPT_LICENSE_TYPES } from './constants'

// -------------------------------------------------------------------
// TYPES
// -------------------------------------------------------------------

export type AccessLevel = 'base' | 'intermedio' | 'avanzato'
export type AccessSource = 'purchase' | 'team' | 'admin' | 'upgrade'

// -------------------------------------------------------------------
// PRODUCT → LEVELS MAPPING (Single Source of Truth)
// -------------------------------------------------------------------

const PRODUCT_TO_LEVELS: Record<string, AccessLevel[]> = {
    // Individual
    'base':             ['base'],
    'intermediate':     ['intermedio'],
    'advanced':         ['avanzato'],
    'complete':         ['base', 'intermedio', 'avanzato'],
    'complete_bundle':  ['base', 'intermedio', 'avanzato'],
    // Team (all levels for all team members)
    'multi_5':           ['base', 'intermedio', 'avanzato'],
    'multi_10':          ['base', 'intermedio', 'avanzato'],
    'multi_25':          ['base', 'intermedio', 'avanzato'],
    // Scuola
    'scuola_10':         ['base', 'intermedio', 'avanzato'],
}

// Course level → access_level mapping
const COURSE_LEVEL_MAP: Record<string, AccessLevel> = {
    'Base':        'base',
    'Intermedio':  'intermedio',
    'Avanzato':    'avanzato',
    'Laboratorio': 'avanzato', // Fallback for future use
}

// -------------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------------

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * Returns which access levels a product_code grants.
 * Returns empty array if product_code is unknown.
 */
export function getLevelsForProduct(productCode: string): AccessLevel[] {
    return PRODUCT_TO_LEVELS[productCode] || []
}

/**
 * Returns the required access_level for a given courseId.
 * Looks up the course in coursesData.ts to find its level.
 * Returns null if course not found.
 */
export function getRequiredLevel(courseId: string): AccessLevel | null {
    const course = courses.find(c => c.id === courseId)
    if (!course) return null
    return COURSE_LEVEL_MAP[course.level] || null
}

// -------------------------------------------------------------------
// GRANT ACCESS
// -------------------------------------------------------------------

/**
 * Grants access levels for a purchased product.
 * Inserts into user_access with ON CONFLICT DO NOTHING (idempotent).
 * 
 * @param userId - The user's UUID
 * @param productCode - The purchased product code (e.g. 'base', 'team_5')
 * @param source - How the access was granted
 * @param purchaseId - Optional reference to the purchase record
 * @param teamLicenseId - Optional reference to the team license
 */
export async function grantAccessForProduct(
    userId: string,
    productCode: string,
    source: AccessSource = 'purchase',
    purchaseId?: string,
    teamLicenseId?: string
): Promise<{ success: boolean; levelsGranted: AccessLevel[]; error?: string }> {
    const levels = getLevelsForProduct(productCode)

    if (levels.length === 0) {
        // Unknown product code — don't fail, but return empty
        console.warn(`[accessControl] Unknown product_code: ${productCode}, no levels granted`)
        return { success: true, levelsGranted: [] }
    }

    const supabase = getSupabaseAdmin()
    const records = levels.map(level => ({
        user_id: userId,
        access_level: level,
        source,
        purchase_id: purchaseId || null,
        team_license_id: teamLicenseId || null,
    }))

    // Upsert with ON CONFLICT DO NOTHING (idempotent)
    const { error } = await supabase
        .from('user_access')
        .upsert(records, {
            onConflict: 'user_id,access_level',
            ignoreDuplicates: true
        })

    if (error) {
        console.error('[accessControl] Grant error:', error)
        return { success: false, levelsGranted: [], error: error.message }
    }

    return { success: true, levelsGranted: levels }
}

/**
 * Grants all access levels for a team member.
 * Used when a team invitation is accepted.
 */
export async function grantTeamMemberAccess(
    userId: string,
    teamLicenseId: string
): Promise<{ success: boolean; error?: string }> {
    const levels: AccessLevel[] = ['base', 'intermedio', 'avanzato']
    const supabase = getSupabaseAdmin()

    const records = levels.map(level => ({
        user_id: userId,
        access_level: level,
        source: 'team' as AccessSource,
        team_license_id: teamLicenseId,
    }))

    const { error } = await supabase
        .from('user_access')
        .upsert(records, {
            onConflict: 'user_id,access_level',
            ignoreDuplicates: true
        })

    if (error) {
        console.error('[accessControl] Team grant error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// -------------------------------------------------------------------
// CHECK ACCESS
// -------------------------------------------------------------------

/**
 * Checks if a user has access to a specific course.
 * 
 * @param userId - The user's UUID
 * @param courseId - The course slug (e.g. '01-caldaia-decisioni')
 * @returns { authorized, requiredLevel, courseTitle }
 */
export async function checkCourseAccess(userId: string, courseId: string): Promise<{
    authorized: boolean
    requiredLevel: AccessLevel | null
    courseTitle: string | null
    courseNotFound: boolean
}> {
    // 1. Find the course and its level
    const course = courses.find(c => c.id === courseId)
    if (!course) {
        return { authorized: false, requiredLevel: null, courseTitle: null, courseNotFound: true }
    }

    const requiredLevel = COURSE_LEVEL_MAP[course.level]
    if (!requiredLevel) {
        return { authorized: false, requiredLevel: null, courseTitle: course.title, courseNotFound: false }
    }

    // 2. Check user_access
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from('user_access')
        .select('id')
        .eq('user_id', userId)
        .eq('access_level', requiredLevel)
        .maybeSingle()

    if (error) {
        console.error('[accessControl] Check error:', error)
    }

    if (data) {
        return { authorized: true, requiredLevel, courseTitle: course.title, courseNotFound: false }
    }

    // 3. Check team membership (team members get full access to all levels)
    const { data: teamMember, error: teamErr } = await supabase
        .from('team_members')
        .select('team_license_id')
        .eq('user_id', userId)
        .is('removed_at', null)
        .maybeSingle()

    if (teamErr) {
        console.error('[accessControl] Team check error:', teamErr)
    }

    if (teamMember) {
        return { authorized: true, requiredLevel, courseTitle: course.title, courseNotFound: false }
    }

    // 4. Check team ownership (owner also gets full access)
    const { data: ownedTeam, error: ownErr } = await supabase
        .from('team_licenses')
        .select('id')
        .eq('owner_user_id', userId)
        .maybeSingle()

    if (ownErr) {
        console.error('[accessControl] Owner check error:', ownErr)
    }

    if (ownedTeam) {
        return { authorized: true, requiredLevel, courseTitle: course.title, courseNotFound: false }
    }

    return {
        authorized: false,
        requiredLevel,
        courseTitle: course.title,
        courseNotFound: false
    }
}

// -------------------------------------------------------------------
// CHECK VIDEO ACCESS BY BUNNY ID (for /api/bunny-token)
// -------------------------------------------------------------------

/**
 * Verifies if a user has access to a video identified by its Bunny Stream UUID.
 * Maps bunnyVideoId → courseId → checkCourseAccess.
 * Returns { authorized, courseId, error? }
 */
export async function checkVideoAccessByBunnyId(userId: string, bunnyVideoId: string): Promise<{
    authorized: boolean
    courseId: string | null
    error?: string
}> {
    // Find the course matching this Bunny video ID
    const course = courses.find(c => c.bunnyVideoId === bunnyVideoId)
    if (!course) {
        return { authorized: false, courseId: null, error: 'video_not_found' }
    }

    const result = await checkCourseAccess(userId, course.id)
    return {
        authorized: result.authorized,
        courseId: course.id
    }
}

// -------------------------------------------------------------------
// REVOKE ACCESS
// -------------------------------------------------------------------

/**
 * Revokes ALL access for a user.
 * Used by admin revocation.
 */
export async function revokeAllAccess(userId: string): Promise<void> {
    const supabase = getSupabaseAdmin()
    await supabase.from('user_access').delete().eq('user_id', userId)
}

/**
 * Checks if a user has an exempt license type (e.g., scuola) that bypasses video budget limits.
 * Checks both direct purchases and team membership.
 */
export async function isUserBudgetExempt(userId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin()
    
    // 1. Check direct purchases with exempt product codes
    const { data: exemptPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .in('product_code', EXEMPT_LICENSE_TYPES)
        .eq('status', 'completed')
        .maybeSingle()
    
    if (exemptPurchase) return true
    
    // 2. Check if user is a member of a team with exempt license
    const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_license_id')
        .eq('user_id', userId)
        .is('removed_at', null)
        .maybeSingle()
    
    if (teamMember) {
        const { data: teamLicense } = await supabase
            .from('team_licenses')
            .select('id')
            .eq('id', teamMember.team_license_id)
            .maybeSingle()
        
        if (teamLicense) {
            // Check if the purchase that created this team has an exempt product_code
            const { data: teamPurchase } = await supabase
                .from('purchases')
                .select('id')
                .eq('team_license_id', teamLicense.id)
                .in('product_code', EXEMPT_LICENSE_TYPES)
                .eq('status', 'completed')
                .maybeSingle()
            
            if (teamPurchase) return true
        }
    }
    
    // 3. Check if user OWNS a team with exempt license
    const { data: ownedTeam } = await supabase
        .from('team_licenses')
        .select('id')
        .eq('owner_user_id', userId)
        .maybeSingle()
    
    if (ownedTeam) {
        const { data: ownerPurchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('team_license_id', ownedTeam.id)
            .in('product_code', EXEMPT_LICENSE_TYPES)
            .eq('status', 'completed')
            .maybeSingle()
        
        if (ownerPurchase) return true
    }
    
    return false
}
