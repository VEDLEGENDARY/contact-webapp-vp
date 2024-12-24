import { supabase } from './supabaseClient';

// Fetch all contacts
export const fetchContacts = async () => {
  const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

// Add a new contact
export const addContact = async (contact: { first_name: string; last_name: string; email: string; phone_number: string }) => {
  const { data, error } = await supabase.from('contacts').insert([contact]);
  if (error) throw new Error(error.message);
  return data;
};

// Update an existing contact
export const updateContact = async (id: string, updates: Partial<{ first_name: string; last_name: string; email: string; phone_number: string }>) => {
  const { data, error } = await supabase.from('contacts').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
  return data;
};

// Delete a contact
export const deleteContact = async (id: string) => {
  const { data, error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return data;
};
