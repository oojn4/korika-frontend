import { Anchor, Box, List, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { Link } from 'react-router-dom';
import { ADMINROUTES } from '../../constants/routeConstants';

const SidebarComponent = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box>
      <List>
        {ADMINROUTES.map((ar) => 
          <Anchor
            key={ar.key}
            component={Link}
            to={ar.path}
            style={{ display: 'block', padding: theme.spacing.xs, color: colorScheme === 'dark' ? theme.colors.dark[1] : theme.black, textDecoration: 'none' }}
          >
            {ar.name}
          </Anchor>
        )}
      </List>
    </Box>
  );
};

export default SidebarComponent;
