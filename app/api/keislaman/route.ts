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
    const { kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi, budget, pengeluaran, kehadiran } = body;
    
    // Konversi ke Number
    const numBudget = Number(budget) || 0;
    const numPengeluaran = Number(pengeluaran) || 0;
    
    // Kalkulasi sisa uang yang mau dibalikin ke kas Bendahara
    const sisaBudget = numBudget - numPengeluaran;
    
    let txId = null;

    // LOGIKA BARU: Cuma dicatat ke Keuangan kalau status Selesai & ada kembalian
    if (status === 'Selesai' && sisaBudget > 0) {
      const newTx = await prisma.transaction.create({
        data: {
          date: new Date(),
          description: `Sisa Uang Konsumsi ${kegiatan} - ${tanggal} (Piket: ${konsumsi || petugas || '-'})`,
          type: 'IN', // SEKARANG JADI UANG MASUK (PEMASUKAN)
          amount: sisaBudget, // NOMINAL YANG DIMASUKIN ADALAH SISA UANGNYA
          category: 'Divisi Keislaman',
        }
      });
      txId = newTx.id;
    }
    
    const newData = await prisma.islamicActivity.create({
      data: {
        kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi,
        budget: numBudget,
        pengeluaran: numPengeluaran,
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
    const { id, kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi, budget, pengeluaran, kehadiran } = body;
    
    const oldData = await prisma.islamicActivity.findUnique({ where: { id: Number(id) } });
    if (!oldData) return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });

    let currentTxId = oldData.transactionId;
    const numBudget = Number(budget) || 0;
    const numPengeluaran = Number(pengeluaran) || 0;
    const sisaBudget = numBudget - numPengeluaran;

    // LOGIKA BARU UNTUK UPDATE
    if (currentTxId) {
      if (status === 'Selesai' && sisaBudget > 0) {
        // Kalau diedit (misal pengeluaran ganti), transaksi di bendahara ngikutin sisa terbarunya
        await prisma.transaction.update({
          where: { id: currentTxId },
          data: { 
            description: `Sisa Uang Konsumsi ${kegiatan} - ${tanggal} (Piket: ${konsumsi || petugas || '-'})`, 
            type: 'IN', // UBAH JADI UANG MASUK
            amount: sisaBudget 
          }
        });
      } else {
        // Kalau misal statusnya dibalikin jadi "Batal/Upcoming" atau sisa uangnya 0, hapus catatan di bendahara
        await prisma.transaction.delete({ where: { id: currentTxId } });
        currentTxId = null;
      }
    } else if (status === 'Selesai' && sisaBudget > 0) {
      // Kalau sebelumnya belum ada transaksi tapi sekarang statusnya Selesai, buat baru
      const newTx = await prisma.transaction.create({
        data: { 
          date: new Date(), 
          description: `Sisa Uang Konsumsi ${kegiatan} - ${tanggal} (Piket: ${konsumsi || petugas || '-'})`, 
          type: 'IN', 
          amount: sisaBudget, 
          category: 'Divisi Keislaman' 
        }
      });
      currentTxId = newTx.id;
    }
    
    const updatedData = await prisma.islamicActivity.update({
      where: { id: Number(id) },
      data: { 
        kegiatan, tanggal, status, mc, penceramah, petugas, konsumsi, 
        budget: numBudget, 
        pengeluaran: numPengeluaran, 
        kehadiran: Number(kehadiran), 
        transactionId: currentTxId 
      }
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