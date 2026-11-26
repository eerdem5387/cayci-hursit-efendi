import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";

// Giriş yapmış müşterinin kendi siparişleri. Tamamlanmamış ödeme denemeleri listelenmez.
export async function GET() {
    const session = await auth();
    const email = session?.user?.email;
    const userId = (session?.user as any)?.id as string | undefined;
    if (!email) return NextResponse.json({ ok: false, error: "Giriş yapmalısınız" }, { status: 401 });

    const orders = await prisma.order.findMany({
        where: {
            OR: [{ customerEmail: { equals: email, mode: "insensitive" } }, ...(userId ? [{ userId }] : [])],
            status: { notIn: ["pending", "odeme_basarisiz"] },
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    const items = await Promise.all(orders.map((o) => serializeOrder(o)));
    return NextResponse.json({ ok: true, items });
}
