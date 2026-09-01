// Supabase Projects Client & Types Integration
// File: src/data/projectsSupabase.js

/**
 * @typedef {Object} ProjectRecord
 * @property {string} id - UUID primary key
 * @property {string} title - Project display name
 * @property {string} slug - Unique URL slug (e.g. 'gatwala-commercial-hub')
 * @property {string|null} client - Developer or client name
 * @property {string} category - Category (e.g. 'Commercial Retail & Corporate')
 * @property {string|null} description - Project narrative
 * @property {string} cover_image_url - Primary media asset
 * @property {string[]} gallery_urls - Array of gallery image URLs
 * @property {string|null} completion_date - Completion date (YYYY-MM-DD)
 * @property {boolean} featured - Featured highlight flag
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * Helper function to fetch all featured projects from Supabase
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<ProjectRecord[]>}
 */
export async function getFeaturedProjects(supabase) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured projects:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Helper function to fetch a single project by unique slug
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} slug
 * @returns {Promise<ProjectRecord|null>}
 */
export async function getProjectBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching project with slug "${slug}":`, error.message);
    throw error;
  }
  return data;
}
