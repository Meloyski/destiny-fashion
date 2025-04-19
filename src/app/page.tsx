import { Container } from "@mui/material";
import PlayerSearchAutocomplete from "@/components/PlayerSearchAutocomplete";
import Logo from "@/components/Logo";

const HomePage = () => {
  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Logo />
      <PlayerSearchAutocomplete />
    </Container>
  );
};

export default HomePage;
