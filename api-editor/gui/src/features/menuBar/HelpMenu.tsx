import { Box, Button, Icon, Menu, MenuButton, MenuGroup, MenuItem, MenuList } from '@chakra-ui/react';
import React from 'react';
import { FaBug, FaChevronDown, FaLightbulb } from 'react-icons/fa';
import { bugReportURL, featureRequestURL, userGuideURL } from '../externalLinks/urlBuilder';

export const HelpMenu = function () {
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
                                window.open(userGuideURL, '_blank');
                            }}
                        >
                            User Guide
                        </MenuItem>
                    </MenuGroup>
                    <MenuGroup title="Feedback">
                        <MenuItem
                            paddingLeft={8}
                            onClick={() => {
                                window.open(bugReportURL, '_blank');
                            }}
                            icon={<FaBug />}
                        >
                            Report a Bug
                        </MenuItem>
                        <MenuItem
                            paddingLeft={8}
                            onClick={() => {
                                window.open(featureRequestURL, '_blank');
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
