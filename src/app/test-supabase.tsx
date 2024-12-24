'use client';

import { useEffect, useState } from 'react';
import { fetchContacts } from '../../../lib/dataService';

export default function TestSupabase() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchContacts();
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    getData();
  }, []);

  return (
    <div>
      <h1>Test Supabase Connection</h1>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>{`${contact.first_name} ${contact.last_name}`}</li>
        ))}
      </ul>
    </div>
  );
}
