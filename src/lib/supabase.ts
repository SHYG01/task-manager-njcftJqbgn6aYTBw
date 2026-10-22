import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wvrxahcypnduhtzzxtwi.supabase.co';
const supabaseKey = 'sb_publishable_SadQmXrnp9Ral9CN8nuRgw_9fRzjNF6';

export const supabase = createClient(supabaseUrl, supabaseKey);
