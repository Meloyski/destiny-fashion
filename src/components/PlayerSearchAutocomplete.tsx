"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  TextField,
  Typography,
  Skeleton,
  Stack,
  MenuItem,
  Chip,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { getBungieApiKey } from "@/lib/bungie";

type GuardianOption = {
  displayName: string;
  displayTag: string;
  membershipId: string;
  membershipType: number;
  emblemPath: string;
  lastPlayed: string;
};

type PlayerSearchAutocompleteProps = {
  defaultValueFromQuery?: boolean;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};

const PlayerSearchAutocomplete = ({
  defaultValueFromQuery,
}: PlayerSearchAutocompleteProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<GuardianOption[]>([]);
  const [defaultValue, setDefaultValue] = useState<GuardianOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const searchGuardians = useMemo(() => {
    let cancelToken: any;
    return async (query: string) => {
      if (!query || query.length < 3) {
        setOptions([]);
        return;
      }

      setShowSkeleton(true);
      setLoading(true);
      try {
        if (cancelToken) cancelToken.cancel();
        cancelToken = axios.CancelToken.source();

        const res = await axios.post(
          "https://www.bungie.net/Platform/User/Search/GlobalName/0/",
          { displayNamePrefix: query },
          {
            headers: {
              "X-API-Key": getBungieApiKey(),
              "Content-Type": "application/json",
            },
            cancelToken: cancelToken.token,
          }
        );

        const users = res.data.Response.searchResults;

        const found: GuardianOption[] = await Promise.all(
          users.map(async (user: any) => {
            const primary =
              user.destinyMemberships.find((m: any) => m.isCrossSavePrimary) ??
              user.destinyMemberships[0];

            if (!primary) return null;

            const baseName = user.bungieGlobalDisplayName ?? "Unknown";
            const displayTag = `#${
              user.bungieGlobalDisplayNameCode?.toString().padStart(4, "0") ??
              "0000"
            }`;
            const displayName = `${baseName}${displayTag}`;

            try {
              const profileRes = await axios.get(
                `https://www.bungie.net/Platform/Destiny2/${primary.membershipType}/Profile/${primary.membershipId}/?components=100,200`,
                {
                  headers: {
                    "X-API-Key": getBungieApiKey(),
                  },
                }
              );

              const charactersData = Object.values(
                profileRes.data.Response?.characters?.data ?? {}
              ) as { emblemPath: string; dateLastPlayed: string }[];

              const lastPlayed = charactersData.sort(
                (a, b) =>
                  new Date(b.dateLastPlayed).getTime() -
                  new Date(a.dateLastPlayed).getTime()
              )[0];

              const emblemPath = lastPlayed?.emblemPath ?? primary.iconPath;

              return {
                displayName,
                displayTag,
                membershipId: primary.membershipId,
                membershipType: primary.membershipType,
                emblemPath: `https://www.bungie.net${emblemPath}`,
                lastPlayed: lastPlayed?.dateLastPlayed ?? "",
              };
            } catch {
              return {
                displayName,
                displayTag,
                membershipId: primary.membershipId,
                membershipType: primary.membershipType,
                emblemPath: `https://www.bungie.net${primary.iconPath}`,
                lastPlayed: "",
              };
            }
          })
        );

        setOptions(found.filter(Boolean));
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Search error:", err);
      } finally {
        setShowSkeleton(false);
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    if (defaultValueFromQuery && searchParams) {
      const id = searchParams.get("membershipId");
      const type = searchParams.get("membershipType");

      if (id && type) {
        const fetchDefault = async () => {
          try {
            const res = await axios.get(
              `https://www.bungie.net/Platform/Destiny2/${type}/Profile/${id}/?components=100,200`,
              {
                headers: { "X-API-Key": getBungieApiKey() },
              }
            );

            const userInfo = res.data.Response?.profile?.data?.userInfo;
            const characterIds =
              res.data.Response?.profile?.data?.characterIds ?? [];
            const charactersData = res.data.Response?.characters?.data ?? {};

            const baseName = userInfo?.bungieGlobalDisplayName ?? "";
            const displayTag = `#${
              userInfo?.bungieGlobalDisplayNameCode
                ?.toString()
                .padStart(4, "0") ?? "0000"
            }`;
            const displayName = `${baseName}${displayTag}`;

            const emblemPath =
              charactersData[characterIds[0]]?.emblemPath ??
              userInfo?.iconPath ??
              "";

            setDefaultValue({
              displayName,
              displayTag,
              membershipId: id,
              membershipType: parseInt(type),
              emblemPath: `https://www.bungie.net${emblemPath}`,
              lastPlayed: "",
            });

            setInputValue(displayName);
          } catch (err) {
            console.error("Failed to fetch default guardian info:", err);
          }
        };

        fetchDefault();
      }
    }
  }, [defaultValueFromQuery, searchParams]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 250);
  }, [inputValue]);

  useEffect(() => {
    searchGuardians(searchTerm);
  }, [searchTerm, searchGuardians]);

  const skeletonOptions: GuardianOption[] = Array.from(
    { length: 4 },
    (_, i) => ({
      displayName: "",
      displayTag: "",
      membershipId: `skeleton-${i}`,
      membershipType: 0,
      emblemPath: "",
      lastPlayed: "",
    })
  );

  const avatarSize = 40;

  return (
    <Autocomplete<GuardianOption>
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={showSkeleton ? skeletonOptions : options}
      filterOptions={(x) => x}
      getOptionLabel={(option) => option.displayName}
      value={defaultValue}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, selected) => {
        const user = selected as GuardianOption;
        if (!user || user.membershipId.includes("skeleton")) return;
        router.push(
          `/guardian?membershipId=${user.membershipId}&membershipType=${user.membershipType}`
        );
      }}
      noOptionsText={
        inputValue.length < 3
          ? "Start typing a Bungie ID"
          : showSkeleton
          ? ""
          : "No Guardians found"
      }
      isOptionEqualToValue={(option, value) =>
        option.membershipId === value.membershipId &&
        option.membershipType === value.membershipType
      }
      popupIcon={null}
      PaperComponent={(props) => (
        <Paper
          {...props}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.2,
            mt: 1,
          }}
        />
      )}
      renderOption={(props, option) => {
        const isSkeleton = option.membershipId.startsWith("skeleton");

        return (
          <MenuItem {...props} key={option.membershipId}>
            {isSkeleton ? (
              <Stack direction="row" alignItems="center" gap={2}>
                <Skeleton
                  variant="circular"
                  width={avatarSize}
                  height={avatarSize}
                />
                <Stack>
                  <Skeleton variant="text" width={200} height={20} />
                  <Skeleton variant="text" width={75} height={16} />
                </Stack>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" gap={2}>
                <Avatar
                  src={option.emblemPath}
                  sx={{ width: avatarSize, height: avatarSize }}
                />
                <Stack>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography sx={{ lineHeight: 1, fontWeight: "500" }}>
                      {option.displayName.replace(option.displayTag, "")}
                    </Typography>
                    <Chip
                      label={option.displayTag}
                      size="small"
                      variant="filled"
                      sx={{ fontSize: 12, height: 20 }}
                    />
                  </Stack>
                  {option.lastPlayed && (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    >
                      Last active: {formatTimeAgo(option.lastPlayed)}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            )}
          </MenuItem>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Lookup a Guardian..."
          sx={{
            "& .MuiOutlinedInput-root": {
              paddingRight: `9px!important`,
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ px: 1, display: "flex", alignItems: "center" }}>
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </Box>
            ),
            endAdornment: (
              <Box sx={{ pr: 1, display: "flex", alignItems: "center" }}>
                <KeyboardArrowDownIcon
                  fontSize="small"
                  sx={{
                    color: "text.secondary",
                    transition: "transform 0.3s ease",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </Box>
            ),
          }}
        />
      )}
    />
  );
};

export default PlayerSearchAutocomplete;
