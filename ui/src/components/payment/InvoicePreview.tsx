"use client";

import { Invoice } from "@/types/payment";
import Link from "next/link";

interface InvoicePreviewProps {
  invoice: Invoice;
  onDownload?: () => void;
  onPrint?: () => void;
}

export default function InvoicePreview({
  invoice,
  onDownload,
  onPrint,
}: InvoicePreviewProps) {
  const formatCurrency = (amount: number, currency: "INR" | "EUR") => {
    return new Intl.NumberFormat(
      currency === "INR" ? "en-IN" : "en-EU",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: "Paid",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      failed: {
        label: "Failed",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
      refunded: {
        label: "Refunded",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Invoice Header */}
      <div className="mb-6 flex flex-col justify-between sm:flex-row">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Invoice #{invoice.invoiceNumber}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:text-right">
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      {/* Invoice Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        {/* Company & Customer Info */}
        <div className="mb-8 grid gap-8 border-b border-gray-200 pb-8 sm:grid-cols-2 dark:border-gray-700">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              From
            </h3>
            <p className="font-semibold text-gray-900 dark:text-white">
              CarHealth Platform
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              support@carhealth.com
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              +91 1800-123-4567
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Bill To
            </h3>
            <p className="font-semibold text-gray-900 dark:text-white">
              {invoice.customerName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invoice.customerEmail}
            </p>
            {invoice.customerPhone && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.customerPhone}
              </p>
            )}
            {invoice.billingAddress && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>{invoice.billingAddress.street}</p>
                <p>
                  {invoice.billingAddress.city}, {invoice.billingAddress.state}{" "}
                  {invoice.billingAddress.zipCode}
                </p>
                <p>{invoice.billingAddress.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(invoice.issuedAt).toLocaleDateString()}
            </p>
          </div>
          {invoice.dueDate && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {invoice.paidAt && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(invoice.paidAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Item
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    {formatCurrency(item.price, item.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </span>
          </div>
          {invoice.discount && invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Discount</span>
              <span className="text-green-600 dark:text-green-400">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax (GST)</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(invoice.tax, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Total
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(invoice.total, invoice.currency)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Thank you for your business! If you have any questions about this
            invoice, please contact us at support@carhealth.com
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-4">
        {onDownload && (
          <button
            onClick={onDownload}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Download PDF
          </button>
        )}
        {onPrint && (
          <button
            onClick={onPrint}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Print Invoice
          </button>
        )}
        <Link
          href="/profile"
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Back to Profile
        </Link>
      </div>
    </div>
  );
}
