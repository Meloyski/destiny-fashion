"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Skeleton,
  Stack,
  Grid,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  getItemDefinition,
  getSocketPlug,
  preloadManifest,
} from "@/lib/manifestCache";
import { getBungieApiKey } from "@/lib/bungie";
import Logo from "@/components/Logo";
import PlayerSearchAutocomplete from "@/components/PlayerSearchAutocomplete";

// Preload Destiny manifest
preloadManifest();

type ArmorItem = {
  itemHash: number;
  itemInstanceId: string;
  name: string;
  type: string;
  icon: string;
  shaderName: string | null;
  shaderIcon: string | null;
  ornamentName: string | null;
  ornamentIcon: string | null;
  baseName?: string | null;
  tier: number;
};

type CharacterArmor = {
  raceGender: string;
  characterId: string;
  className: string;
  emblem: string;
  overlay: string;
  secondaryIcon: string;
  special: string;
  light: number;
  armor: ArmorItem[];
};

const CLASS_HASHES: Record<number, string> = {
  0: "Titan",
  1: "Hunter",
  2: "Warlock",
};

const RACE_TYPES: Record<number, string> = {
  0: "Human",
  1: "Awoken",
  2: "Exo",
};

const GENDERS: Record<number, string> = {
  0: "Male",
  1: "Female",
};

const GuardianPage = () => {
  const searchParams = useSearchParams();
  const membershipId = searchParams?.get("membershipId") ?? "";
  const membershipType = searchParams?.get("membershipType") ?? "";

  const [characterArmor, setCharacterArmor] = useState<CharacterArmor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGuardian = async () => {
      if (!membershipId || !membershipType) return;

      setLoading(true);

      try {
        const res = await axios.get(
          `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200,205,300,305`,
          { headers: { "X-API-Key": getBungieApiKey() } }
        );

        const characters = res.data.Response.characters.data;
        const equipped = res.data.Response.characterEquipment.data;
        const sockets = res.data.Response.itemComponents.sockets.data;

        const armorBuckets = [
          3448274439, // Helmet
          3551918588, // Gauntlets
          14239492, // Chest
          20886954, // Legs
          1585787867, // Class Item
        ];

        const armorByCharacter: CharacterArmor[] = [];

        for (const [id, data] of Object.entries(characters) as [
          string,
          any
        ][]) {
          const emblemDef = await getItemDefinition(data.emblemHash);

          const className = CLASS_HASHES[data.classType];
          const light = data.light;
          const emblem = `https://www.bungie.net${data.emblemBackgroundPath}`;
          const overlay = `https://www.bungie.net${
            emblemDef.secondaryOverlay ?? ""
          }`;
          const secondaryIcon = `https://www.bungie.net${
            emblemDef.secondaryIcon ?? ""
          }`;
          const special = `https://www.bungie.net${
            emblemDef.secondarySpecial ?? ""
          }`;

          const items = equipped[id]?.items ?? [];
          const resolvedArmor: ArmorItem[] = await Promise.all(
            items
              .filter((item: { bucketHash: number }) =>
                armorBuckets.includes(item.bucketHash)
              )
              .map(
                async (item: {
                  itemHash: number;
                  itemInstanceId: string;
                  bucketHash: number;
                }) => {
                  const itemDef = await getItemDefinition(item.itemHash);
                  const socketData =
                    sockets?.[item.itemInstanceId]?.sockets ?? [];

                  let shaderPlug = null;
                  let ornamentPlug = null;

                  for (const socket of socketData) {
                    const plug = await getSocketPlug(socket.plugHash);
                    const cat = plug?.plug?.plugCategoryIdentifier;
                    const display = plug?.itemTypeDisplayName;

                    if (!shaderPlug && cat?.includes("shader")) {
                      shaderPlug = plug;
                    }

                    if (
                      !ornamentPlug &&
                      (cat?.includes("skins") || display?.includes("Ornament"))
                    ) {
                      ornamentPlug = plug;
                    }
                  }

                  return {
                    itemHash: item.itemHash,
                    itemInstanceId: item.itemInstanceId,
                    name:
                      ornamentPlug?.displayProperties?.name &&
                      ornamentPlug.displayProperties.name !== "Default Ornament"
                        ? ornamentPlug.displayProperties.name
                        : itemDef?.displayProperties?.name ?? "Unknown Item",
                    baseName: ornamentPlug
                      ? itemDef?.displayProperties?.name
                      : null,
                    type: itemDef?.itemTypeDisplayName ?? "Armor",
                    icon: `https://www.bungie.net${
                      ornamentPlug?.displayProperties?.icon &&
                      ornamentPlug.displayProperties.name !== "Default Ornament"
                        ? ornamentPlug.displayProperties.icon
                        : itemDef?.displayProperties?.icon ?? ""
                    }`,
                    shaderName: shaderPlug?.displayProperties?.name ?? null,
                    shaderIcon: shaderPlug?.displayProperties?.icon
                      ? `https://www.bungie.net${shaderPlug.displayProperties.icon}`
                      : null,
                    ornamentName: ornamentPlug?.displayProperties?.name ?? null,
                    ornamentIcon: ornamentPlug?.displayProperties?.icon
                      ? `https://www.bungie.net${ornamentPlug.displayProperties.icon}`
                      : null,
                    tier: itemDef?.inventory?.tierType ?? 0,
                  };
                }
              )
          );

          const raceGender = `${RACE_TYPES[data.raceType]} ${
            GENDERS[data.genderType]
          }`;

          armorByCharacter.push({
            characterId: id,
            className,
            light,
            emblem,
            overlay,
            secondaryIcon,
            special,
            armor: resolvedArmor,
            raceGender,
          });
        }

        setCharacterArmor(armorByCharacter);
      } catch (err) {
        console.error("❌ Failed to fetch Guardian:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuardian();
  }, [membershipId, membershipType]);

  return (
    <>
      <Container maxWidth="xs" sx={{ mt: 6 }}>
        <Logo />
        <PlayerSearchAutocomplete />
      </Container>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Guardian Loadout
        </Typography>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(3)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ padding: 0 }}>
                    <Skeleton variant="rectangular" width="100%" height={64} />
                    <Stack
                      spacing={3}
                      mt={6}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {[...Array(5)].map((_, j) => (
                        <Stack
                          key={j}
                          spacing={1}
                          sx={{ width: "100%", px: 4 }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Skeleton
                              variant="rounded"
                              width={64}
                              height={64}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton width="80%" height={24} />
                              <Skeleton width="60%" height={18} />
                            </Box>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {characterArmor.map(
              ({ className, armor, special, overlay, light, raceGender }) => (
                <Grid key={className} size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ padding: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={2}
                        sx={{
                          backgroundImage: `url(${special})`,
                          backgroundSize: "cover",
                          height: 64,
                          px: 2,
                        }}
                      >
                        <Box>
                          <Box
                            component="img"
                            src={overlay}
                            alt="overlay"
                            height={60}
                            sx={{ position: "relative", top: 24 }}
                          />
                        </Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          flex={1}
                          sx={{ px: 1 }}
                        >
                          <Stack>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 500,
                                fontSize: 26,
                                lineHeight: 1,
                              }}
                            >
                              {className}
                            </Typography>
                            <Typography color="textSecondary" variant="body2">
                              {raceGender}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center">
                            <Box
                              sx={{
                                position: "relative",
                                top: -7,
                                right: 1,
                                fontWeight: 900,
                              }}
                            >
                              ⟡
                            </Box>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: 700, mb: 0.25 }}
                            >
                              {light}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack
                        spacing={3}
                        mt={6}
                        alignItems="center"
                        justifyContent="center"
                      >
                        {armor.map((item) => (
                          <Stack
                            key={item.itemInstanceId}
                            spacing={1}
                            sx={{ width: "100%", px: 4 }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                variant="rounded"
                                src={item.icon}
                                alt={item.name}
                                sx={{ width: 64, height: 64 }}
                              />
                              <Box>
                                <Stack gap={0.5} mb={1}>
                                  {item.tier === 6 ? (
                                    <>
                                      <Typography
                                        variant="body1"
                                        sx={{ fontWeight: 700, lineHeight: 1 }}
                                      >
                                        {item.baseName ?? item.name}
                                      </Typography>
                                      {item.ornamentName && item.baseName && (
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{ lineHeight: 1 }}
                                        >
                                          {item.name}
                                        </Typography>
                                      )}
                                    </>
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 700, lineHeight: 1 }}
                                    >
                                      {item.name}
                                    </Typography>
                                  )}
                                </Stack>
                                {item.shaderName && (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Avatar
                                      src={item.shaderIcon ?? ""}
                                      alt={item.shaderName}
                                      sx={{ width: 14, height: 14 }}
                                      variant="square"
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                      {item.shaderName}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            )}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default GuardianPage;
