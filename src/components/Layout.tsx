import type { FC } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LogoutIcon from "@mui/icons-material/Logout";
import { authStore } from "../stores/AuthStore";
import { PATHS } from "../PATHS";

export const Layout: FC = observer(() => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = await authStore.logout();
    if (ok) {
      navigate(PATHS.login);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between" }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DirectionsCarIcon color="primary" />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontSize: 17 }}
              >
                Путевые листы
              </Typography>
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              {authStore.user?.email && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {authStore.user.email}
                </Typography>
              )}

              <Button
                size="small"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
});
