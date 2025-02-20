import { Box, Center, Loader } from '@mantine/core'
import React from 'react'

const LoaderComponent = () => {
  return (
    <Box pos="relative">
      <Center>
        <Loader mt='25%' size='108' />
        <Loader mt='25%' size='108' />
        <Loader mt='25%' size='108' />
      </Center>
    </Box>
  )
}

export default React.memo(LoaderComponent)
