"use client";


import Link from "next/link";
import { Menu, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {useState, useEffect} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Map, {Marker} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";




export default function WelcomePage() {


 const [menuOpen, setMenuOpen] = useState(false);
 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [eventsOpen, setEventsOpen] = useState(false);
 const [markers, setMarkers] = useState<{ id: string; lng: number; lat: number; type: string }[]>([]);
 const [viewState, setViewState] = useState({ longitude: -73.94, latitude: 40.82, zoom: 11 });
 const [selectedResource, setSelectedResource] = useState<any>(null);
 const [loadingResource, setLoadingResource] = useState(false);

 async function handleMarkerClick(id: string) {
   setSelectedResource(null);
   setLoadingResource(true);
   try {
     const res = await fetch(`https://platform.foodhelpline.org/api/resources/${id}`);
     const raw = await res.json();
     // response may be superjson-wrapped
     const resource = raw.json ?? raw;
     setSelectedResource(resource);
   } catch (err) {
     console.error("Failed to load resource:", err);
   } finally {
     setLoadingResource(false);
   }
 }

 async function loadMarkers(bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }) {
   try {
     const url = `https://platform.foodhelpline.org/api/resources/markersWithinBounds`
       + `?corner=${bounds.minLng},${bounds.minLat}&corner=${bounds.maxLng},${bounds.maxLat}`;
     const res = await fetch(url);
     if (!res.ok) throw new Error(`HTTP ${res.status}`);
     const raw = await res.json();

     // markersWithinBounds returns a GeoJSON FeatureCollection (may be superjson-wrapped)
     const featureCollection = raw.features ? raw : raw.json;
     const features: any[] = featureCollection?.features ?? [];

     setMarkers(features
       .filter((f: any) => f.geometry?.coordinates?.length >= 2)
       .map((f: any) => ({
         id: f.properties.id,
         type: f.properties.resourceTypeId,
         lng: f.geometry.coordinates[0],
         lat: f.geometry.coordinates[1],
       }))
     );
   } catch (err) {
     console.error("Error loading markers:", err);
   }
 }

useEffect(() => {
  loadMarkers({ minLng: -74.1, minLat: 40.7, maxLng: -73.8, maxLat: 40.9 });
}, []);

 return (
   <div className="min-h-screen bg-[#fff8df] flex flex-col">


{/* HEADER */}
    <header className="relative bg-[#ffcb00] border-b">
       <div className="grid grid-cols-3 items-center px-2 py-2">


   <div className="flex items-center gap-4">
{/* menu/search icons */}
   <Menu className="w-6 h-8 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} />
   <Search className="w-6 h-6 cursor-pointer" onClick={() => setSearchOpen(!searchOpen)}/>
   </div>


{/* logo */}
   <div className="flex justify-center">
     <Link href="/" className="flex items-center gap-2">
       <img src="/logo_icon.svg" className="h-9 w-auto" alt="logo icon" width={32} height={32} />
       <img src="/logo_name.svg" className="h-9 w-auto" alt="logo name" width={128} height={32} />
     </Link>
   </div>


<div className="flex justify-end gap-4">


{/* login button */}
 <Link href="/login">
   <button className="px-6 py-2 border-2 border-black text-black rounded-lg tracking-wide hover:bg-yellow-400 transition">
     LOG IN
   </button>
 </Link>


{/* sign up button */}
 <Link href="/signup">
   <button className="px-6 py-2 rounded-lg text-white tracking-wide bg-gradient-to-r from-[#6b4bc3] to-[#7f5bd6] shadow-md hover:opacity-90 transition">
     GET STARTED
   </button>
 </Link>


{/* opens search*/}
</div>
       </div>
       </header>


   {searchOpen && (
 <div className="w-full bg-white border-b shadow-sm p-4 flex justify-center">
   <input
     type="text"
     placeholder="Search events, food locations..."
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
     className="w-full max-w-xl border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6942b5]"
   />
 </div>
)}


{/* opens sidebar */}
{menuOpen && (
 <>
    <div
     className="fixed inset-0 bg-black/30 z-40"
     onClick={() => setMenuOpen(false)}
   />


<div className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 p-6 flex flex-col">


{/* menu logo */}
     <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2">
   <img
     src="/logo_icon.svg"
     alt="Lemontree icon"
     className="h-8 w-auto"
   />
   <img
     src="/logo_name.svg"
     alt="Lemontree name"
     className="h-8 w-auto"
   />
 </Link>


       <button onClick={() => setMenuOpen(false)} className="text-2xl font-bold text-gray-600 hover:text-black">
         ✕
       </button>
     </div>


{/* menu links */}
<nav className="flex flex-col text-lg">
 <Link href="/" className="px-3 py-2 rounded-md text-black hover:bg-gray-100 transition">
   Welcome
 </Link>


 <Link href="/map" className="px-3 py-2 rounded-md text-black hover:bg-gray-100 transition">
   Dashboard
 </Link>
<div>


{/* events drop downs */}
 <button
 onClick={() => setEventsOpen(!eventsOpen)}
 className="w-full flex justify-between items-center px-3 py-2 rounded-md text-black hover:bg-gray-100 transition"
>
 Events


 {eventsOpen ? (
   <ChevronUp className="w-5 h-5" />
 ) : (
   <ChevronDown className="w-5 h-5" />
 )}


</button>




 {eventsOpen && (
   <div className="ml-4 flex flex-col text-sm">


     <Link
       href="/events"
       className="px-3 py-2 rounded-md text-black hover:bg-gray-100"
     >
       Create Events
     </Link>


     <Link
       href="/events/create"
       className="px-3 py-2 rounded-md text-black hover:bg-gray-100"
     >
       Manage Event
     </Link>


     <Link
       href="/events/past"
       className="px-3 py-2 rounded-md text-black hover:bg-gray-100"
     >
       Past Events
     </Link>


   </div>
 )}


</div>


 <Link href="/how-it-works" className="px-3 py-2 rounded-md text-black hover:bg-gray-100 transition">
   Flyer Generator
 </Link>


 <Link href="/volunteer" className="px-3 py-2 rounded-md text-black hover:bg-gray-100 transition">
   Community Leaderboard
 </Link>


 <Link href="/about" className="px-3 py-2 rounded-md text-black hover:bg-gray-100 transition">
   My Profile
 </Link>


</nav>




{/* bottom buttons */}
     <div className="mt-auto flex flex-col gap-4">
       <button className="bg-[#6942b5] text-white py-3 rounded-lg">
         Donate
       </button>


       <button className="border border-[#06bcb1] text-[#06bcb1] py-3 rounded-lg">
         Share
       </button>
     </div>


   </div>
 </>
)}




{/* Main Content */}
<main className="flex-1 w-full">
  <div className="relative h-[500px] flex items-center justify-center">
    <div className="absolute inset-0 h-[500px] opacity-30">
    <Map
  mapLib={maplibregl}
  {...viewState}
  onMove={(e) => setViewState(e.viewState)}
  onMoveEnd={(e) => {
    const b = e.target.getBounds();
    loadMarkers({ minLng: b.getWest(), minLat: b.getSouth(), maxLng: b.getEast(), maxLat: b.getNorth() });
  }}
  style={{ width: "100%", height: "100%" }}
  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
>
  {markers.map((m) => (
    <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="center">
      <div
        onClick={() => handleMarkerClick(m.id)}
        title={m.type === "SOUP_KITCHEN" ? "Soup Kitchen" : "Food Pantry"}
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "2px solid white",
          background: m.type === "SOUP_KITCHEN" ? "#E86F51" : "#6942b5",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.6)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
    </Marker>
  ))}
</Map>
</div>

  {/* Resource detail panel — outside opacity-30 div so it renders at full opacity */}
  {(loadingResource || selectedResource) && (
    <div style={{
      position: "absolute", top: 16, right: 16, zIndex: 30,
      width: 280, background: "white", borderRadius: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.18)", padding: 20,
    }}>
      <button
        onClick={() => setSelectedResource(null)}
        style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#666" }}
      >✕</button>

      {loadingResource ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <div className="lt-spinner" style={{ width: 32, height: 32, borderTopColor: "#6942b5" }} />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
              padding: "2px 8px", borderRadius: 99,
              background: selectedResource.resourceType?.id === "SOUP_KITCHEN" ? "#fde8e2" : "#ede5f7",
              color: selectedResource.resourceType?.id === "SOUP_KITCHEN" ? "#E86F51" : "#6942b5",
            }}>
              {selectedResource.resourceType?.name ?? "Resource"}
            </span>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#1a1a1a" }}>
            {selectedResource.name ?? "Unnamed Resource"}
          </h3>

          {(selectedResource.addressStreet1 || selectedResource.city) && (
            <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              📍 {[selectedResource.addressStreet1, selectedResource.city, selectedResource.state].filter(Boolean).join(", ")}
            </p>
          )}

          {selectedResource.contacts?.[0]?.phone && (
            <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              📞 {selectedResource.contacts[0].phone}
            </p>
          )}

          {selectedResource.occurrences?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#999", marginBottom: 4 }}>NEXT OPEN</p>
              {selectedResource.occurrences.slice(0, 2).map((o: any) => (
                <p key={o.id} style={{ fontSize: 13, color: "#444" }}>
                  {new Date(o.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {" · "}
                  {new Date(o.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {" – "}
                  {new Date(o.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              ))}
            </div>
          )}

          {selectedResource.website && (
            <a href={selectedResource.website} target="_blank" rel="noreferrer"
              style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "#6942b5", fontWeight: 600 }}>
              Visit website →
            </a>
          )}
        </>
      )}
    </div>
  )}

{/* Hero Section — pointer-events-none so clicks pass through to the map */}
    <section className="relative z-10 pointer-events-none max-w-5xl mx-auto flex flex-col items-center text-center py-32 px-6">
         <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#6942b5]">
           Welcome to Lemontree's Volunteer Hub
         </h1>

         <p className="text-gray-600 mb-6 max-w-xl">
           Help connect communities to nearby food resources
         </p>

         <button className="pointer-events-auto bg-[#6942b5] text-white px-6 py-3 rounded-full hover:bg-[#5a34a0] transition">
           Start Volunteering
         </button>
       </section>
     </div>


       {/* Features */}
       <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-6">


 {/* ABOUT US */}
 <div className="bg-[#06bcb1] text-white rounded-xl shadow-lg p-8 flex flex-col justify-between">


   <div>
     <h3 className="text-xl font-bold mb-3">About Us</h3>


     <p className="text-sm opacity-90">
       Learn about Lemontree's mission to connect communities with
       nearby food resources and empower volunteers to make a
       meaningful impact.
     </p>
   </div>


   <Link href="https://www.foodhelpline.org/about">
     <button className="bg-[#77d1cb] text-white px-6 py-3 rounded-full hover:bg-white hover:text-[#77d1cb] transition">
           Learn More
         </button>


   </Link>


 </div>




 {/* ORGANIZE EVENTS */}
 <div className="bg-[#fd5839] text-white rounded-xl shadow-lg p-8 flex flex-col justify-between">


   <div>
     <h3 className="text-xl font-bold mb-3">Organize Events</h3>


     <p className="text-sm opacity-90">
       Coordinate volunteer events, manage food drives,
       and collaborate with local organizations to
       support community food access.
     </p>
   </div>


   <Link href="/events">
     <button className="bg-[#f5917f] text-white px-6 py-3 rounded-full hover:bg-white hover:text-[#f5917f] transition">
           View Events
         </button>
   </Link>


 </div>




 {/* EARN POINTS */}
 <div className="bg-[#754bc5] text-white rounded-xl shadow-lg p-8 flex flex-col justify-between">


   <div>
     <h3 className="text-xl font-bold mb-3">Earn Points</h3>


     <p className="text-sm opacity-90">
       Track your volunteer contributions, earn reward
       points, and celebrate milestones while helping
       communities access essential food resources.
     </p>
   </div>


   <Link href="/points">
     <button className="bg-[#8767c2] text-white px-6 py-3 rounded-full hover:bg-white hover:text-[#8767c2] transition">
           See Rewards
         </button>
   </Link>


 </div>


</section>
     </main>
   </div>
 );
}
