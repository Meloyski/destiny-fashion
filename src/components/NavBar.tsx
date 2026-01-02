import {
  AppBar,
  Box,
  IconButton,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Toolbar,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
// Icons
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayerSearchAutocomplete from "./PlayerSearchAutocomplete";
import Logo from "./Logo";
import ToggleSwitch from "./ToggleSwitch";
import React from "react";
import { useColorMode } from "@/theme/ColorModeContext";

const NavBar = () => {
  const { toggleColorMode, mode } = useColorMode();
  const isDark = mode === "dark";

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const theme = useTheme();

  return (
    <AppBar position="fixed" sx={{ p: { sm: 3, xs: 2 }, background: "none" }}>
      <Toolbar
        sx={{
          color: theme.palette.text.secondary,
          borderRadius: `${theme.shape.borderRadius}px`,
          display: "flex",
          alignItems: "center",
          width: "100%",
          background: alpha(theme.palette.background.paper, 0.75),
          backdropFilter: `blur(6px)`,
        }}
      >
        {/* Left section */}
        <Stack direction="row" alignItems="center" flexBasis="100%">
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Stack
            alignItems="center"
            justifyContent="flex-start"
            direction="row"
          >
            <Logo />
          </Stack>
        </Stack>

        {/* Center search */}
        <Stack direction="row" flexBasis="100%" justifyContent="center">
          <Box sx={{ width: "100%", maxWidth: 350 }}>
            <PlayerSearchAutocomplete />
          </Box>
        </Stack>

        {/* Right side */}
        <Stack direction="row-reverse" alignItems="center" flexBasis="100%">
          <IconButton
            size="medium"
            edge="end"
            color="inherit"
            aria-label="more"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </IconButton>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box sx={{ py: 1, width: 225 }}>
              <ListItemButton dense onClick={toggleColorMode}>
                <ListItemText primary="Light/Dark Mode" />
                <ToggleSwitch checked={isDark} />
              </ListItemButton>
            </Box>
          </Popover>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
