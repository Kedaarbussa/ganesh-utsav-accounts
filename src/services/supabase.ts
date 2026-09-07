import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xrbftdxdasiyyjcphryd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lDlkB7VcLKcitCfS6XtaQg_QpE67zQK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
