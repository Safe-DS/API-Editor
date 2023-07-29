import {
    Box,
    Button,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuList,
    useToast,
} from '@chakra-ui/react';
import React from 'react';
import { FaBug, FaChevronDown, FaLightbulb } from 'react-icons/fa';

export const HelpMenu = function () {
    const toast = useToast()

    return (
        <Box>
            <Menu>
                <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                    Help
                </MenuButton>
                <MenuList>
                    <MenuGroup title="Documentation">
                        <MenuItem
                            paddingLeft={8}
                            onClick={() => {
                                toast({
                                    colorScheme: "blue",
                                    description: "Removed for double-blind review."
                                })
                            }}
                        >
                            User Guide
                        </MenuItem>
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup title="Feedback">
                        <MenuItem
                            paddingLeft={8}
                            onClick={() => {
                                toast({
                                    colorScheme: "blue",
                                    description: "Removed for double-blind review."
                                })
                            }}
                            icon={<FaBug />}
                        >
                            Report a Bug
                        </MenuItem>
                        <MenuItem
                            paddingLeft={8}
                            onClick={() => {
                                toast({
                                    colorScheme: "blue",
                                    description: "Removed for double-blind review."
                                })
                            }}
                            icon={<FaLightbulb />}
                        >
                            Request a Feature
                        </MenuItem>
                    </MenuGroup>
                </MenuList>
            </Menu>
        </Box>
    );
};
