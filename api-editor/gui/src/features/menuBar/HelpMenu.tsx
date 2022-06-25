import { Box, Button, Icon, Menu, MenuButton, MenuGroup, MenuItem, MenuList } from '@chakra-ui/react';
import React from 'react';
import { FaBug, FaChevronDown, FaLightbulb } from 'react-icons/fa';
import { bugReportURL, featureRequestURL } from '../reporting/issueURLBuilder';

export const HelpMenu = function () {
    return (
        <Box>
            <Menu>
                <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                    Help
                </MenuButton>
                <MenuList>
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
