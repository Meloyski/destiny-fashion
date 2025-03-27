"use client";

import { Button, Container, Typography } from "@mui/material";

type HomeProps = {};

const Home = (props: HomeProps) => {
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Destiny Fashion
      </Typography>
      <Button variant="contained" href="/api/bungie/login">
        Sign in with Bungie
      </Button>
    </Container>
  );
};

export default Home;
