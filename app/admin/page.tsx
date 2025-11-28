'use client';

import { useState, useEffect } from 'react';

interface Domain {
  id: number;
  name: string;
  price: number;
  status: string;
}

export default function Admin() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = () => {
    fetch('/api/domains').then(res => res.json()).then(setDomains);
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const newDomain = { name, price: parseInt(price), status: 'available' };
    await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDomain),
    });
    setName('');
    setPrice('');
    fetchDomains();
  };

  const handleMarkSold = async (id: number) => {
    await fetch('/api/domains', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'sold' }),
    });
    fetchDomains();
  };

  const handleDelete = async (id: number) => {
    await fetch('/api/domains', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchDomains();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
      <form onSubmit={handleAdd} className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Domain</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Domain Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add</button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map(domain => (
          <div key={domain.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{domain.name}</h2>
            <p className="text-gray-600">${domain.price}</p>
            <p className="text-sm text-gray-500">Status: {domain.status}</p>
            <div className="flex gap-2 mt-2">
              {domain.status === 'available' && (
                <button
                  onClick={() => handleMarkSold(domain.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Mark Sold
                </button>
              )}
              <button
                onClick={() => handleDelete(domain.id)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}