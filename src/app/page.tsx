"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { Edit, Trash2, Plus, Check } from "lucide-react";
import { z } from "zod";

// Zod schema for validating the contact form
const contactSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
    email: z
      .string()
      .max(100, "Email is too long. Please enter an email address with a maximum of 100 characters.")
      // First refine: Check for '@' symbol
      .refine(value => value.includes('@'), {
        message: "Email must contain '@'.",
      })
      // Second refine: Check for '.' after '@' and something following it
      .refine(value => value.includes('.') && value.split('@')[1].includes('.'), {
        message: "Email must contain a '.' after '@' and something following it.",
      })
      // Regular expression check for valid email structure
      .refine(value => /^[^@]+@[^@]+\.[^@]+$/.test(value), {
        message: "Please enter a valid email address.",
      }),
    phoneNumber: z
      .string()
      .min(10, "Phone number should be at least 10 characters")
      .max(15, "Phone number is too long"),
});


const Home = () => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [newContact, setNewContact] = useState({
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchContacts = async () => {
            const { data, error } = await supabase.from("contacts").select("*");
            if (error) {
                console.error("Error fetching contacts:", error);
            }
            setContacts(data || []);
        };

        fetchContacts();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewContact((prev) => ({ ...prev, [name]: value }));
    };

    const validateInputs = () => {
        try {
            contactSchema.parse({
                firstName: newContact.firstName,
                lastName: newContact.lastName,
                email: newContact.email,
                phoneNumber: newContact.phoneNumber,
            });
            setError(""); // Clear error if validation passes
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.errors[0].message); // Set the error from Zod validation
            }
            return false;
        }
    };

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateInputs()) return;

        const contactExists = contacts.some((contact) => contact.id === newContact.id);

        if (newContact.id && contactExists) {
            // Update existing contact
            const { error } = await supabase
                .from("contacts")
                .update({
                    first_name: newContact.firstName,
                    last_name: newContact.lastName,
                    email: newContact.email,
                    phone_number: newContact.phoneNumber,
                })
                .eq("id", newContact.id);

            if (error) {
                console.error("Error updating contact:", error);
                return;
            }
        } else {
            // Add new contact
            const { error } = await supabase
                .from("contacts")
                .insert([{
                    first_name: newContact.firstName,
                    last_name: newContact.lastName,
                    email: newContact.email,
                    phone_number: newContact.phoneNumber,
                }]);

            if (error) {
                console.error("Error adding contact:", error);
                return;
            }
        }

        // Reset form
        setNewContact({ id: null, firstName: "", lastName: "", email: "", phoneNumber: "" });

        // Fetch updated contacts
        const { data, error: fetchError } = await supabase.from("contacts").select("*");
        if (fetchError) {
            console.error("Error fetching contacts:", fetchError);
        }
        setContacts(data || []);
    };

    const handleEditContact = (contact: any) => {
        setNewContact({
            id: contact.id,
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: contact.email,
            phoneNumber: contact.phone_number,
        });
    };

    const handleDeleteContact = async (id: number) => {
        const { error } = await supabase.from("contacts").delete().eq("id", id);
        if (error) {
            console.error("Error deleting contact:", error);
            return;
        }

        // Fetch updated contacts
        const { data, error: fetchError } = await supabase.from("contacts").select("*");
        if (fetchError) {
            console.error("Error fetching contacts:", fetchError);
        }
        setContacts(data || []);
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-6xl font-semibold mb-6 text-center">Contact Registry</h1>

            <form
                onSubmit={handleAddContact}
                className="mb-6 flex flex-wrap justify-center gap-4 relative"
            >
                {/* Form layout for inputs */}
                <div className="w-full">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={newContact.firstName}
                        onChange={handleInputChange}
                        className="p-3 w-full border rounded h-12"
                    />
                </div>
                <div className="w-full">
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={newContact.lastName}
                        onChange={handleInputChange}
                        className="p-3 w-full border rounded h-12"
                    />
                </div>
                <div className="w-full">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newContact.email}
                        onChange={handleInputChange}
                        className="p-3 w-full border rounded h-12"
                    />
                </div>
                <div className="w-full">
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={newContact.phoneNumber}
                        onChange={handleInputChange}
                        className="p-3 w-full border rounded h-12"
                    />
                </div>

                <div className="w-full">
                    <button
                        type="submit"
                        className="bg-red-500 text-white p-3 w-full rounded h-12 flex items-center justify-center"
                    >
                        {newContact.id ? <Check size={32} /> : <Plus size={32} />}
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 absolute -bottom-6 w-full text-center">
                        {error}
                    </p>
                )}
            </form>

            <ul className="space-y-4 mt-10">
                {contacts.map((contact: any) => (
                    <li
                        key={contact.id}
                        className="p-4 border-b rounded-md flex flex-wrap justify-between items-center shadow-md"
                    >
                        <div className="flex-1">
                            <strong>
                                {contact.first_name} {contact.last_name}
                            </strong>
                            <p>{contact.email}</p>
                            <p>{contact.phone_number}</p>
                        </div>
                        <div className="flex flex-wrap space-x-4 justify-start">
                            <button
                                onClick={() => handleEditContact(contact)}
                                className="bg-yellow-500 text-white p-2 rounded-full h-12 w-12 flex items-center justify-center mt-[10px] sm:mt-0"
                            >
                                <Edit size={24} />
                            </button>
                            <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="bg-red-500 text-white p-2 rounded-full h-12 w-12 flex items-center justify-center mt-[10px] sm:mt-0"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
