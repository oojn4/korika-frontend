import { rem } from "@mantine/core";
import { IconCheck, IconExclamationMark, IconSpeakerphone, IconX } from "@tabler/icons-react";

const warnIcon = <IconExclamationMark style={{ width: rem(20), height: rem(20) }} />
const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />
const speakerIcon = <IconSpeakerphone style={{ width: rem(20), height: rem(20) }} />

export { checkIcon, speakerIcon, warnIcon, xIcon };
