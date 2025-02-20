import { Group, Paper, SimpleGrid, Space, Text, Title } from '@mantine/core';
import { IconArticle, IconUser } from '@tabler/icons-react';
import { useEffect } from 'react';
import classes from './Admin.module.css';

const AdminPage = () => {
  // const [amountUser, setAmountUser] = useState<number>(0)
  // const [articleApproved, setArticleApproved] = useState<Article[]>([]);
  // const [articleWaiting, setArticleWaiting] = useState<Article[]>([]);
  // const [userWaiting, setUserWaiting] = useState<UserAsResponse[]>([]);

  // const handleFetchArticleApproved = async() => {
  //   const response : ArticleResponse = await ArticleService.indexArticle();
  //   setArticleApproved(response.data);
  // }

  // const handleFetchArticleWaiting = async() => {
  //   const response : ArticleResponse = await ArticleService.indexArticleWaiting();
  //   setArticleWaiting(response.data);
  // }

  // const handleFetchUserWaiting = async () => {
  //   const response : ShowRegistrationResponse = await UserService.showAllRegistration();
  //   if (!response.success) {
  //     return;
  //   }
  //   setUserWaiting(response.data.data);
  // };

  // const fetchAmountUser = async () => {
  //   const response : AmountSingleResponse = await UserService.amountUser();
  //   if(!response.success) {
  //     return 
  //   }
  //   setAmountUser(response.data)
  // };

  useEffect(() => {
    console.log("ok")
    // fetchAmountUser()
    // handleFetchArticleApproved()
    // handleFetchArticleWaiting()
    // handleFetchUserWaiting()
  })

  // const articleData = [
  //   { 
  //     label: 'Waiting', 
  //     count: articleWaiting.length, 
  //     part: articleWaiting.length*100/(articleWaiting.length+articleApproved.length), 
  //     color: '#D3D3D3' 
  //   },
  //   { 
  //     label: 'Approved', 
  //     count: articleApproved.length, 
  //     part: articleApproved.length*100/(articleWaiting.length+articleApproved.length), 
  //     color: '#47d6ab' 
  //   },
  // ];

  // const articleSegments = articleData.map((segment) => (
  //   <Progress.Section value={segment.part} color={segment.color} key={segment.color}>
  //     <Progress.Label>{segment.part.toFixed(2)}%</Progress.Label>
  //   </Progress.Section>
  // ));

  // const articleDescriptions = articleData.map((stat) => (
  //   <Box key={stat.label} style={{ borderBottomColor: stat.color }} className={classes.stat}>
  //     <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
  //       {stat.label}
  //     </Text>

  //     <Group justify="space-between" align="flex-end" gap={0}>
  //       <Text fw={700}>{stat.count}</Text>
  //       <Text c={stat.color} fw={700} size="sm" className={classes.statCount}>
  //         {stat.part.toFixed(2)}%
  //       </Text>
  //     </Group>
  //   </Box>
  // ));

  // const userData = [
  //   { 
  //     label: 'Waiting', 
  //     count: userWaiting.length, 
  //     part: userWaiting.length*100/(userWaiting.length+amountUser), 
  //     color: '#D3D3D3' 
  //   },
  //   { 
  //     label: 'Approved', 
  //     count: amountUser, 
  //     part: amountUser*100/(userWaiting.length+amountUser), 
  //     color: '#47d6ab' 
  //   },
  // ];

  // const userSegments = userData.map((segment) => (
  //   <Progress.Section value={segment.part} color={segment.color} key={segment.color}>
  //     <Progress.Label>{segment.part.toFixed(2)}%</Progress.Label>
  //   </Progress.Section>
  // ));

  // const userDescriptions = userData.map((stat) => (
  //   <Box key={stat.label} style={{ borderBottomColor: stat.color }} className={classes.stat}>
  //     <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
  //       {stat.label}
  //     </Text>

  //     <Group justify="space-between" align="flex-end" gap={0}>
  //       <Text fw={700}>{stat.count}</Text>
  //       <Text c={stat.color} fw={700} size="sm" className={classes.statCount}>
  //         {stat.part.toFixed(2)}%
  //       </Text>
  //     </Group>
  //   </Box>
  // ));

  return (
    <div className={classes.root}>
      <Title order={1}>Welcome to Admin Panel</Title>
      <Space h="lg" />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between">
            <Text fz="xl" fw={700}>
              ARTICLES
            </Text>
            <IconArticle size="1.4rem" className={classes.icon} stroke={1.5} />
          </Group>

          {/* <Progress.Root size={34} classNames={{ label: classes.progressLabel }} mt={40}>
            {articleSegments}
          </Progress.Root>
          <SimpleGrid cols={{ base: 1, xs: 2 }} mt="xl">
            {articleDescriptions}
          </SimpleGrid> */}
        </Paper>
        
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between">
            <Group align="flex-end" gap="xs">
              <Text fz="xl" fw={700}>
                USERS
              </Text>
            </Group>
            <IconUser size="1.4rem" className={classes.icon} stroke={1.5} />
          </Group>

          {/* <Progress.Root size={34} classNames={{ label: classes.progressLabel }} mt={40}>
            {userSegments}
          </Progress.Root>
          <SimpleGrid cols={{ base: 1, xs: 2 }} mt="xl">
            {userDescriptions}
          </SimpleGrid> */}
        </Paper>
      </SimpleGrid>
    </div>
  );
}

export default AdminPage;