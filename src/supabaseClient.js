// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrwutzrusqxprvkageap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3V0enJ1c3F4cHJ2a2FnZWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTk1MzAsImV4cCI6MjA2MzI3NTUzMH0.CSLutxTBxi3DA689d2KAP0KEtuR7AyDTVdhBIiATP4E';

export const supabase = createClient(supabaseUrl, supabaseKey);
