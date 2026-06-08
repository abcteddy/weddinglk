const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbryduxjzgdhsqolcpla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicnlkdXhqemdkaHNxb2xjcGxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ3NjI3OSwiZXhwIjoyMDk2MDUyMjc5fQ.ytd-ouo5R9Yr1VfntfhZ0d1XbC6j21T8vtiUmge6fMQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data, error } = await supabase
      .from('couples')
      .select('builder_config')
      .eq('slug', 'lahiru-hanshani-2026')
      .single();

    if (error) {
      console.error('Error fetching config:', error);
    } else {
      console.log('Builder Config:', JSON.stringify(data.builder_config, null, 2));
    }
  } catch (e) {
    console.error('Crash:', e);
  }
}

check();
