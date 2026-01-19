"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import InvoicePreview from "@/components/payment/InvoicePreview";
import { Invoice, PaymentDetails } from "@/types/payment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Load invoice (in production, this would be an API call)
    const loadInvoice = () => {
      const invoiceId = params.id as string;
      
      // Try to get payment first, then generate invoice
      const paymentId = invoiceId.startsWith("pay_") ? invoiceId : `pay_${invoiceId}`;
      const storedPayment = localStorage.getItem(paymentId);

      if (storedPayment) {
        try {
          const payment: PaymentDetails = JSON.parse(storedPayment);
          
          // Generate invoice from payment
          const generatedInvoice: Invoice = {
            id: `inv_${Date.now()}`,
            invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
            paymentId: payment.id,
            customerName: user?.email?.split("@")[0] || user?.phone || "Customer",
            customerEmail: user?.email || "",
            customerPhone: user?.phone,
            items: payment.items,
            subtotal: payment.subtotal,
            tax: payment.tax,
            discount: payment.discount,
            total: payment.total,
            currency: payment.currency,
            status: payment.status,
            issuedAt: payment.createdAt,
            paidAt: payment.completedAt,
          };

          setInvoice(generatedInvoice);
        } catch (error) {
          console.error("Error parsing payment:", error);
          // Set mock invoice on error
          setInvoice({
            id: `inv_${Date.now()}`,
            invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
            paymentId: paymentId,
            customerName: user?.email?.split("@")[0] || user?.phone || "Customer",
            customerEmail: user?.email || "",
            customerPhone: user?.phone,
            billingAddress: {
              street: "123 Main Street",
              city: "Mumbai",
              state: "Maharashtra",
              zipCode: "400001",
              country: "India",
            },
            items: [
              {
                id: "report_1",
                name: "Car Health Report",
                description: "Comprehensive AI-powered health report",
                quantity: 1,
                price: 999,
                currency: "INR",
              },
            ],
            subtotal: 999,
            tax: 179.82,
            total: 1178.82,
            currency: "INR",
            status: "completed",
            issuedAt: new Date().toISOString(),
            paidAt: new Date().toISOString(),
          });
        }
      } else {
        // Mock invoice for demo
        setInvoice({
          id: `inv_${Date.now()}`,
          invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
          paymentId: paymentId,
          customerName: user?.email?.split("@")[0] || user?.phone || "Customer",
          customerEmail: user?.email || "",
          customerPhone: user?.phone,
          billingAddress: {
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India",
          },
          items: [
            {
              id: "report_1",
              name: "Car Health Report",
              description: "Comprehensive AI-powered health report",
              quantity: 1,
              price: 999,
              currency: "INR",
            },
          ],
          subtotal: 999,
          tax: 179.82,
          total: 1178.82,
          currency: "INR",
          status: "completed",
          issuedAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
        });
      }

      setIsLoading(false);
    };

    loadInvoice();
  }, [params.id, user, isAuthenticated, router]);

  const handleDownload = () => {
    // In production, this would download a PDF
    alert("Invoice download functionality would be implemented here");
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Invoice Not Found
          </h2>
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400 sm:text-2xl"
          >
            CarHealth
          </Link>
          <Link
            href="/profile"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Profile
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <InvoicePreview
          invoice={invoice}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      </main>
    </div>
  );
}
