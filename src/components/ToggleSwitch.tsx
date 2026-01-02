import { styled, Switch } from "@mui/material";
import { SwitchProps } from "@mui/material/Switch";

const ColorModeSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "primary.main",
        ...(theme.applyStyles?.("dark", {
          backgroundColor: "#177ddc",
        }) || {}),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ...(theme.applyStyles?.("dark", {
      backgroundColor: "rgba(255,255,255,.35)",
    }) || {}),
  },
}));

type ThemeToggleSwitchProps = {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
};

const ThemeToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
}: ThemeToggleSwitchProps) => {
  return (
    <ColorModeSwitch
      checked={checked}
      onChange={onChange ? () => onChange() : undefined}
      disabled={disabled}
      slotProps={{ input: { "aria-label": "Light/Dark Toggle Switch" } }}
    />
  );
};

export default ThemeToggleSwitch;
