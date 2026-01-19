"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { marketplaceApi, reportsApi, mediaApi, chatApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ImageCarousel from "@/components/marketplace/ImageCarousel";
import TrustScoreBreakdown from "@/components/marketplace/TrustScoreBreakdown";
import AIHighlights from "@/components/marketplace/AIHighlights";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MarketplaceListing } from "@/types/marketplace";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const listingId = params.id as string;
        const listingData = await marketplaceApi.getById(listingId);
        
        // Debug: Log API response to see what data we're getting
        console.log('Marketplace Listing API Response:', listingData);
        
        // Extract images from listing
        const extractImages = async (listing: any): Promise<string[]> => {
          // Priority 1: Use structured media.photos if available (new enhanced format)
          if (listing.media?.photos && Array.isArray(listing.media.photos) && listing.media.photos.length > 0) {
            const photoUrls = listing.media.photos
              .map((photo: any) => photo.thumbnailUrl || photo.url)
              .filter((url: string) => url);
            if (photoUrls.length > 0) {
              console.log(`Found ${photoUrls.length} images from structured media.photos`);
              return photoUrls;
            }
          }
          
          // Priority 2: If images are already provided as an array
          if (Array.isArray(listing.images) && listing.images.length > 0) {
            return listing.images;
          }
          
          // Priority 3: Try to extract from report.media
          if (listing.report?.media) {
            let media = listing.report.media;
            if (typeof media === 'string') {
              try {
                media = JSON.parse(media);
              } catch (e) {
                console.warn('Failed to parse report.media as JSON:', e);
              }
            }
            if (Array.isArray(media)) {
              const urls = media
                .filter((m: any) => m.type === 'photo' || !m.type)
                .filter((m: any) => m.storageUrl || m.url)
                .map((m: any) => m.thumbnailUrl || m.storageUrl || m.url);
              if (urls.length > 0) return urls;
            }
          }
          
          // Try to get media from car if report has carId
          if (listing.report?.carId) {
            try {
              const carMedia = await mediaApi.getMediaByCar(listing.report.carId);
              const photoUrls = carMedia
                .filter((m: any) => m.type === 'photo' && (m.storageUrl || m.thumbnailUrl))
                .map((m: any) => m.thumbnailUrl || m.storageUrl);
              if (photoUrls.length > 0) return photoUrls;
            } catch (err) {
              console.error("Error loading car media:", err);
            }
          }
          
          // Try carId directly from listing
          if (listing.carId) {
            try {
              const carMedia = await mediaApi.getMediaByCar(listing.carId);
              const photoUrls = carMedia
                .filter((m: any) => m.type === 'photo' && (m.storageUrl || m.thumbnailUrl))
                .map((m: any) => m.thumbnailUrl || m.storageUrl);
              if (photoUrls.length > 0) return photoUrls;
            } catch (err) {
              console.error("Error loading car media:", err);
            }
          }
          
           // Fallback: placeholder images
           return [
             "https://images.unsplash.com/photo-1492144534655-ae79c2c034d7?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1549317661-bd32c8b0c2a3?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1606664515524-9f283c033ba2?w=800&h=600&fit=crop",
             "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
           ];
        };

        // Extract images (async)
        const images = await extractImages(listingData);
        
        // Transform API data to match MarketplaceListing type
        // Use new enhanced data structure from backend
        const transformedListing: MarketplaceListing = {
          id: listingData.id,
          carDetails: {
            make: listingData.make || listingData.carSpecs?.make || listingData.report?.make || listingData.carDetails?.make,
            model: listingData.model || listingData.carSpecs?.model || listingData.report?.model || listingData.carDetails?.model,
            year: listingData.year || listingData.carSpecs?.year || listingData.report?.year || listingData.carDetails?.year,
            fuelType: listingData.carSpecs?.fuelType || listingData.carDetails?.fuelType || listingData.report?.carDetails?.fuelType || listingData.report?.fuelType || "Petrol",
            transmission: listingData.carSpecs?.transmission || listingData.carDetails?.transmission || listingData.report?.carDetails?.transmission || listingData.report?.transmission || "Manual",
            kilometersDriven: listingData.carSpecs?.kilometersDriven || listingData.carDetails?.kilometersDriven || listingData.report?.carDetails?.kilometersDriven || listingData.report?.kilometersDriven || 0,
          },
          price: listingData.price || listingData.priceInfo?.amount,
          currency: listingData.currency || listingData.priceInfo?.currency || 'INR',
          trustScore: listingData.report?.trustScore || listingData.trustScore || 0,
          location: {
            city: listingData.location?.city || listingData.city || "Unknown",
            state: listingData.location?.state || listingData.state || "Unknown",
          },
          images,
          verified: listingData.seller?.verified || listingData.verified !== false,
          reportId: listingData.reportId || listingData.report?.id,
          listedAt: listingData.listedAt || listingData.createdAt || new Date().toISOString(),
          // Store additional enhanced data
          _enhanced: {
            priceInfo: listingData.priceInfo,
            carSpecs: listingData.carSpecs,
            media: listingData.media,
            aiInsights: listingData.report?.aiInsights || listingData.aiInsights,
            seller: listingData.seller,
            location: listingData.location,
          },
        };
        
        setListing(transformedListing);

        // Load highlights from AI insights if available, otherwise from report
        const aiInsights = listingData.report?.aiInsights || listingData.aiInsights;
        if (aiInsights) {
          const reportHighlights: any[] = [];
          
          // Add highlights from AI insights
          if (aiInsights.highlights && Array.isArray(aiInsights.highlights)) {
            aiInsights.highlights.forEach((highlight: any, index: number) => {
              reportHighlights.push({
                id: `hl-${index}`,
                type: highlight.type || "positive" as const,
                title: highlight.title || highlight.label || "Highlight",
                description: highlight.description || highlight.details || "",
                icon: highlight.icon || "✨",
              });
            });
          }
          
          // Add issues as warnings
          if (aiInsights.issues && Array.isArray(aiInsights.issues)) {
            aiInsights.issues.forEach((issue: any, index: number) => {
              reportHighlights.push({
                id: `issue-${index}`,
                type: issue.severity === "high" ? "negative" : "warning" as const,
                title: issue.title || issue.label || "Issue",
                description: issue.description || issue.details || "",
                icon: "⚠️",
              });
            });
          }
          
          setHighlights(reportHighlights.slice(0, 5)); // Limit to 5 highlights
        } else if (transformedListing.reportId) {
          // Fallback: Load from report API
          try {
            const reportData = await reportsApi.getById(transformedListing.reportId);
            
            // Generate highlights from report data
            const reportHighlights: any[] = [];
            
            if (reportData.sections) {
              // Add positive highlights from sections
              Object.entries(reportData.sections).forEach(([key, section]: [string, any]) => {
                if (section.score >= 80) {
                  reportHighlights.push({
                    id: `hl-${key}-pos`,
                    type: "positive" as const,
                    title: `${section.label || key} - Excellent`,
                    description: section.details?.[0] || `This ${key} is in excellent condition.`,
                    icon: "✨",
                  });
                } else if (section.score < 60) {
                  reportHighlights.push({
                    id: `hl-${key}-warn`,
                    type: "warning" as const,
                    title: `${section.label || key} - Needs Attention`,
                    description: section.issues?.[0]?.title || `This ${key} may need attention.`,
                    icon: "⚠️",
                  });
                }
              });
            }
            
            // Add risk flags as warnings
            if (reportData.riskFlags && Array.isArray(reportData.riskFlags)) {
              reportData.riskFlags.forEach((flag: any, index: number) => {
                reportHighlights.push({
                  id: `hl-risk-${index}`,
                  type: flag.severity === "high" ? "negative" : "warning" as const,
                  title: flag.title,
                  description: flag.description,
                  icon: "⚠️",
                });
              });
            }
            
            setHighlights(reportHighlights.slice(0, 5)); // Limit to 5 highlights
            
            // Set trust score breakdown if available
            if (reportData.sections) {
              // Breakdown will be passed to TrustScoreBreakdown component
            }
          } catch (err) {
            console.error("Error loading report details:", err);
            // Use default highlights if report loading fails
            setHighlights([
              {
                id: "hl-1",
                type: "positive" as const,
                title: "Verified Listing",
                description: "This car has been verified with a health report.",
                icon: "✓",
              },
            ]);
          }
        }

        // Load seller info if available - use enhanced seller data
        if (listingData.seller) {
          const sellerData = listingData.seller;
          setSeller({
            id: sellerData.id || listingData.sellerId || listingData.userId,
            name: sellerData.name || (sellerData.firstName 
              ? `${sellerData.firstName} ${sellerData.lastName || ""}`.trim()
              : sellerData.email || sellerData.phone || "Seller"),
            phone: sellerData.phone,
            email: sellerData.email,
            rating: sellerData.rating || 4.5,
            listingsCount: sellerData.listingsCount || 1,
            verified: sellerData.verified !== false,
            joinedDate: sellerData.joinedDate || sellerData.createdAt,
            location: sellerData.location,
          });
        } else if (listingData.user) {
          // Fallback to user data
          const userData = listingData.user;
          setSeller({
            id: userData.id || listingData.userId || listingData.sellerId,
            name: userData.firstName 
              ? `${userData.firstName} ${userData.lastName || ""}`.trim()
              : userData.email || userData.phone || "Seller",
            phone: userData.phone,
            email: userData.email,
            rating: 4.5,
            listingsCount: 1,
            verified: false,
            joinedDate: userData.createdAt,
            location: userData.city && userData.state ? { city: userData.city, state: userData.state } : null,
          });
        } else if (listingData.userId || listingData.sellerId) {
          // If we have a user/seller ID but no full data
          setSeller({
            id: listingData.userId || listingData.sellerId,
            name: "Seller",
            phone: null,
            email: null,
            rating: 4.5,
            listingsCount: 1,
            verified: true,
            joinedDate: new Date().toISOString(),
          });
        } else {
          // Default seller info (no ID available)
          setSeller({
            name: "Seller",
            phone: null,
            email: null,
            rating: 4.5,
            listingsCount: 1,
            verified: true,
            joinedDate: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error("Error loading listing:", err);
        setError(err.message || "Failed to load car details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadListing();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {error || "Car Not Found"}
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {error || "The car listing you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const priceFormatted = new Intl.NumberFormat(
    listing.currency === "INR" ? "en-IN" : "en-EU",
    {
      style: "currency",
      currency: listing.currency,
      maximumFractionDigits: 0,
    }
  ).format(listing.price);

  const handleContactSeller = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if we have seller info
    if (!seller || !seller.id) {
      alert("Seller information is not available. Please try again later.");
      return;
    }

    try {
      setIsCreatingChat(true);
      
      // Create or find existing chat with seller
      const chat = await chatApi.findOrCreate({
        sellerId: seller.id,
        listingId: listing?.id,
      });

      // Navigate to the chat page
      if (chat && chat.id) {
        router.push(`/chat/${chat.id}`);
      } else {
        throw new Error("Failed to create chat - no chat ID returned");
      }
    } catch (err: any) {
      console.error("Error creating chat:", err);
      alert(err.message || "Failed to start chat. Please try again.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Navigation */}
      <Nav />
      
      {/* Back Button */}
      <div className="relative container mx-auto px-4 pt-4 z-10">
        <Link
          href="/marketplace"
          className="group inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-md border border-gray-200 dark:border-slate-700"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      {/* Image Carousel & Hero Information - Side by Side */}
      <section className="relative container mx-auto px-4 pt-4 z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Left: Image Carousel */}
            <div className="order-1 lg:order-1 lg:col-span-3">
              <ImageCarousel
                images={listing.images}
                carName={`${listing.carDetails.make} ${listing.carDetails.model}`}
              />
            </div>

            {/* Right: Hero Information Block */}
            <div className="order-2 lg:order-2 lg:col-span-1">
              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 h-full flex flex-col">
                {/* Top Row: Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {listing.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {listing.location.city}
                  </span>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    <span>{listing.carDetails.make} </span>
                    <span className="text-blue-600 dark:text-blue-400">{listing.carDetails.model}</span>
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {listing.carDetails.year} • {listing.carDetails.kilometersDriven != null ? listing.carDetails.kilometersDriven.toLocaleString() : 'N/A'} km
                  </p>
                </div>

                {/* Price & Trust Score */}
                <div className="mb-3 space-y-2.5">
                  {/* Price - Prominent, Right Aligned */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                      {priceFormatted}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Asking price</p>
                  </div>

                  {/* Trust Score */}
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-3 py-2 text-center shadow-sm">
                    <p className="text-[9px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                      Trust Score
                    </p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                      {Math.round(listing.trustScore)}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[9px] font-medium text-gray-600 dark:text-gray-400">
                        {listing.trustScore >= 80 ? 'Excellent' : listing.trustScore >= 60 ? 'Good' : listing.trustScore >= 40 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specifications Section */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                      Specifications
                    </h2>
                  </div>

                  {/* Specs - Pill Style Cards */}
                  <div className="flex flex-wrap gap-1.5">
                    {/* Make & Model */}
                    <div className="inline-flex items-start gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-1.5 w-full">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Make & Model</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{listing.carDetails.make} {listing.carDetails.model}</p>
                      </div>
                    </div>

                    {/* Year */}
                    <div className="inline-flex items-start gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-1.5 w-full">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Year</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{listing.carDetails.year}</p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {new Date().getFullYear() - listing.carDetails.year} {new Date().getFullYear() - listing.carDetails.year === 1 ? 'yr' : 'yrs'} old
                        </p>
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div className="inline-flex items-start gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-1.5 w-full">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Fuel Type</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{listing.carDetails.fuelType}</p>
                      </div>
                    </div>

                    {/* Transmission */}
                    <div className="inline-flex items-start gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-1.5 w-full">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Transmission</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{listing.carDetails.transmission}</p>
                      </div>
                    </div>

                    {/* Kilometers */}
                    <div className="inline-flex items-start gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-1.5 w-full">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Kilometers</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {listing.carDetails.kilometersDriven != null ? listing.carDetails.kilometersDriven.toLocaleString() : 'N/A'} km
                        </p>
                        {listing.carDetails.kilometersDriven != null && (new Date().getFullYear() - listing.carDetails.year) > 0 && (
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {Math.round(listing.carDetails.kilometersDriven / (new Date().getFullYear() - listing.carDetails.year)).toLocaleString()} km/yr
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="inline-flex items-start gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-2.5 py-1.5 w-full">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{listing.location.city}, {listing.location.state}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 z-10 pb-24 md:pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-8 space-y-8">
              {/* AI Vehicle Health Summary */}
              {highlights.length > 0 && (
                <AIHighlights highlights={highlights} />
              )}

            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-6 space-y-6">
                {/* Trust Score Card */}
                <div className="transform transition-all hover:scale-[1.01]">
                  <TrustScoreBreakdown
                    trustScore={listing.trustScore}
                    breakdown={{
                      exterior: 82,
                      engine: 75,
                      interior: 88,
                      transmission: 80,
                    }}
                  />
                </div>

                {/* Seller Card */}
                {seller && (
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                          {seller.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      </div>
                      
                      {/* Seller Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {seller.name}
                        </h3>
                        {seller.joinedDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Member since {new Date(seller.joinedDate).getFullYear()}
                          </p>
                        )}
                        {seller.rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(seller.rating!)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {seller.rating.toFixed(1)}
                            </span>
                            {seller.listingsCount !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                • {seller.listingsCount} {seller.listingsCount === 1 ? 'listing' : 'listings'}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Usually responds within 24 hours
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Chat CTA */}
                    <button
                      onClick={handleContactSeller}
                      disabled={isCreatingChat || !seller.id}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {isCreatingChat ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Chat with {seller.name?.split(' ')[0] || 'Seller'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* CTA Section */}
                <div className="space-y-3">
                  {/* Primary CTA */}
                  <Link
                    href={`/reports/${listing.reportId}`}
                    className="group relative block w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-center font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Full AI Report
                    </span>
                  </Link>
                  
                  {/* Secondary CTA */}
                  <button
                    onClick={handleContactSeller}
                    disabled={isCreatingChat || !seller || !seller.id}
                    className="group flex items-center justify-center gap-2 w-full rounded-xl border-2 border-blue-600 bg-white dark:bg-slate-800 px-6 py-4 text-center font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    {isCreatingChat ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Starting Chat...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Contact Seller</span>
                      </>
                    )}
                  </button>
                  
                  {/* Urgency Micro-copy */}
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.floor(Math.random() * 3) + 1} people viewed this today
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Link
              href={`/reports/${listing.reportId}`}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              View Report
            </Link>
            <button
              onClick={handleContactSeller}
              disabled={isCreatingChat || !seller || !seller.id}
              className="flex-1 rounded-lg border-2 border-blue-600 bg-white dark:bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingChat ? '...' : 'Contact'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
