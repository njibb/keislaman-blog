import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const data = await prisma.islamicActivity.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal ambil data kegiatan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    // NAH INI DIA FIX-NYA: tambahin konsumsi di sini
    const { kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi, budget, pengeluaran, kehadiran } = body;
    
    let txId = null;

    if (Number(pengeluaran) > 0) {
      const newTx = await prisma.transaction.create({
        data: {
          date: new Date(),
          description: `Konsumsi ${kegiatan} - ${tanggal} (Piket: ${konsumsi || petugas})`,
          type: 'OUT',
          amount: Number(pengeluaran),
          category: 'Divisi Keislaman',
        }
      });
      txId = newTx.id;
    }
    
    const newData = await prisma.islamicActivity.create({
      data: {
        kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi,
        budget: Number(budget),
        pengeluaran: Number(pengeluaran),
        kehadiran: Number(kehadiran),
        transactionId: txId
      }
    });
    return NextResponse.json({ success: true, data: newData });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal tambah kegiatan' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    // DI SINI JUGA DITAMBAHIN konsumsi
    const { id, kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi, budget, pengeluaran, kehadiran } = body;
    
    const oldData = await prisma.islamicActivity.findUnique({ where: { id: Number(id) } });
    if (!oldData) return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });

    let currentTxId = oldData.transactionId;
    const numPengeluaran = Number(pengeluaran);

    if (currentTxId) {
      if (numPengeluaran > 0) {
        await prisma.transaction.update({
          where: { id: currentTxId },
          data: { description: `Konsumsi ${kegiatan} - ${tanggal} (Piket: ${konsumsi || petugas})`, amount: numPengeluaran }
        });
      } else {
        await prisma.transaction.delete({ where: { id: currentTxId } });
        currentTxId = null;
      }
    } else if (numPengeluaran > 0) {
      const newTx = await prisma.transaction.create({
        data: { date: new Date(), description: `Konsumsi ${kegiatan} - ${tanggal} (Piket: ${konsumsi || petugas})`, type: 'OUT', amount: numPengeluaran, category: 'Divisi Keislaman' }
      });
      currentTxId = newTx.id;
    }
    
    const updatedData = await prisma.islamicActivity.update({
      where: { id: Number(id) },
      data: { kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi, budget: Number(budget), pengeluaran: numPengeluaran, kehadiran: Number(kehadiran), transactionId: currentTxId }
    });
    return NextResponse.json({ success: true, data: updatedData });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal update kegiatan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID tidak ditemukan' }, { status: 400 });

    const dataToDelete = await prisma.islamicActivity.findUnique({ where: { id: Number(id) } });
    if (dataToDelete) {
      if (dataToDelete.transactionId) await prisma.transaction.delete({ where: { id: dataToDelete.transactionId } });
      await prisma.islamicActivity.delete({ where: { id: Number(id) } });
    }
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal hapus kegiatan' }, { status: 500 });
  }
}