import { promises as fs } from 'fs';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const data = await fs.readFile('data/domains.json', 'utf-8');
    const domains = JSON.parse(data);
    return Response.json(domains);
  } catch (error) {
    return Response.json({ error: 'Failed to read domains' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newDomain = await request.json();
    const data = await fs.readFile('data/domains.json', 'utf-8');
    const domains = JSON.parse(data);
    newDomain.id = Math.max(...domains.map((d: any) => d.id), 0) + 1;
    domains.push(newDomain);
    await fs.writeFile('data/domains.json', JSON.stringify(domains, null, 2));
    return Response.json(newDomain);
  } catch (error) {
    return Response.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const data = await fs.readFile('data/domains.json', 'utf-8');
    const domains = JSON.parse(data);
    const index = domains.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      domains[index].status = status;
      await fs.writeFile('data/domains.json', JSON.stringify(domains, null, 2));
      return Response.json(domains[index]);
    }
    return Response.json({ error: 'Domain not found' }, { status: 404 });
  } catch (error) {
    return Response.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const data = await fs.readFile('data/domains.json', 'utf-8');
    const domains = JSON.parse(data);
    const filtered = domains.filter((d: any) => d.id !== id);
    await fs.writeFile('data/domains.json', JSON.stringify(filtered, null, 2));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete domain' }, { status: 500 });
  }
}