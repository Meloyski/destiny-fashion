// "use client";

// export const dynamic = "force-dynamic";

// import { useEffect, useState } from "react";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Card,
//   CardMedia,
//   CardContent,
//   Box,
//   Stack,
// } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import axios from "axios";
// import { useSearchParams } from "next/navigation";
// import { getBungieApiKey } from "@/lib/bungie";

// // Mapping of bucketHash to readable names
// const bucketMap: Record<number, string> = {
//   3551918588: "Helmet",
//   14239492: "Gauntlets",
//   20886954: "Chest",
//   1585787867: "Legs",
//   2620835047: "Class Item",
//   3448274439: "Kinetic Weapon",
//   1498876634: "Energy Weapon",
//   2465295065: "Power Weapon",
//   4023194814: "Ghost",
//   2025709351: "Subclass",
// };

// // Simplified class names
// const classMap: Record<number, string> = {
//   0: "Titan",
//   1: "Hunter",
//   2: "Warlock",
// };

// type DestinyItem = {
//   itemHash: number;
//   bucketHash: number;
// };

// type DetailedItem = {
//   name: string;
//   icon: string;
//   itemTypeDisplayName: string;
//   itemHash: number;
//   bucketHash: number;
// };

// const Dashboard = () => {
//   const searchParams = useSearchParams();
//   const encodedToken = searchParams?.get("access_token");
//   const accessToken = encodedToken ? decodeURIComponent(encodedToken) : null;

//   const [items, setItems] = useState<DetailedItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [className, setClassName] = useState<string>("");
//   const [powerLevel, setPowerLevel] = useState<number>(0);
//   const [emblem, setEmblem] = useState<string>("");

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!accessToken) return;

//       try {
//         const headers = {
//           Authorization: `Bearer ${accessToken}`,
//           "X-API-Key": getBungieApiKey()!,
//         };

//         // Step 1: Membership info
//         const membershipRes = await axios.get(
//           "https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/",
//           { headers }
//         );
//         const membership = membershipRes.data.Response.destinyMemberships[0];
//         const membershipId = membership.membershipId;
//         const membershipType = membership.membershipType;

//         // Step 2: Profile + character data
//         const profileRes = await axios.get(
//           `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200`,
//           { headers }
//         );
//         const characterIds = Object.keys(
//           profileRes.data.Response.characters.data
//         );
//         const character =
//           profileRes.data.Response.characters.data[characterIds[0]];

//         setClassName(classMap[character.classType] ?? "Unknown");
//         setPowerLevel(character.light);
//         setEmblem(`https://www.bungie.net${character.emblemBackgroundPath}`);

//         // Step 3: Equipped items
//         const equipmentRes = await axios.get(
//           `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterIds[0]}/?components=205`,
//           { headers }
//         );
//         const equippedItems: DestinyItem[] =
//           equipmentRes.data.Response.equipment.data.items;

//         // Step 4: Resolve items
//         const resolved: DetailedItem[] = await Promise.all(
//           equippedItems.map(async (item) => {
//             try {
//               const res = await fetch(`/api/manifest/${item.itemHash}`);
//               const def = await res.json();

//               return {
//                 name: def.displayProperties?.name ?? "Unknown Item",
//                 icon: def.displayProperties?.icon
//                   ? `https://www.bungie.net${def.displayProperties.icon}`
//                   : "",
//                 itemTypeDisplayName: def.itemTypeDisplayName ?? "",
//                 itemHash: item.itemHash,
//                 bucketHash: item.bucketHash,
//               };
//             } catch {
//               return {
//                 name: "Unknown Item",
//                 icon: "",
//                 itemTypeDisplayName: "Unknown",
//                 itemHash: item.itemHash,
//                 bucketHash: item.bucketHash,
//               };
//             }
//           })
//         );

//         // Sort by known bucket order
//         const slotOrder = Object.keys(bucketMap).map(Number);
//         const sorted = resolved
//           .filter((item) => bucketMap[item.bucketHash])
//           .sort(
//             (a, b) =>
//               slotOrder.indexOf(a.bucketHash) - slotOrder.indexOf(b.bucketHash)
//           );

//         setItems(sorted);
//         setLoading(false);
//       } catch (err: unknown) {
//         if (err && typeof err === "object" && "response" in err) {
//           const e = err as { response?: { data?: unknown }; message?: string };
//           console.error(
//             "❌ Bungie API Error:",
//             e.response?.data ?? e.message ?? err
//           );
//         } else {
//           console.error("❌ Bungie API Error:", err);
//         }
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [accessToken]);

//   if (loading) {
//     return (
//       <Container sx={{ mt: 6 }}>
//         <Typography variant="h4">Loading your Guardian...</Typography>
//         <CircularProgress sx={{ mt: 2 }} />
//       </Container>
//     );
//   }

//   return (
//     <Container sx={{ mt: 4 }}>
//       <Box
//         sx={{
//           backgroundImage: `url(${emblem})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           height: 200,
//           borderRadius: 2,
//           mb: 4,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           px: 4,
//           color: "white",
//         }}
//       >
//         <Typography variant="h3">{className}</Typography>
//         <Typography variant="h4">Power: {powerLevel}</Typography>
//       </Box>

//       <Grid container spacing={3}>
//         {items.map((item) => (
//           <Stack key={item.itemHash}>
//             <Card>
//               <CardMedia
//                 component="img"
//                 image={item.icon}
//                 alt={item.name}
//                 sx={{ height: 100, objectFit: "contain", p: 1 }}
//               />
//               <CardContent>
//                 <Typography variant="subtitle2" color="textSecondary">
//                   {bucketMap[item.bucketHash]}
//                 </Typography>
//                 <Typography variant="h6">{item.name}</Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   {item.itemTypeDisplayName}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Stack>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default Dashboard;

export default function Dashboard() {
  return null;
}
