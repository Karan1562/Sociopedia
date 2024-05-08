import { Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { useLogout } from "../hooks/useLogout";
import { Tooltip } from "@chakra-ui/react";

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  return (
    <>
      <Flex justifyContent={"space-between"} mt={6} mb="12">
        {user && (
          <Tooltip label="Home">
            <Link as={RouterLink} to="/">
              <AiFillHome size={24} />
            </Link>
          </Tooltip>
        )}
        <Image
          cursor={"pointer"}
          alt="logo"
          w={6}
          src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
          onClick={toggleColorMode}
        />
        {user && (
          <Flex gap={4}>
            <Tooltip label="Profile">
              <Link as={RouterLink} to={`/${user.username}`}>
                <RxAvatar size={24} />
              </Link>
            </Tooltip>
            <Tooltip label="Chat">
              <Link as={RouterLink} to={"/chat"}>
                <BsFillChatQuoteFill size={20} />
              </Link>
            </Tooltip>
            {/* <Link as={RouterLink} to={"/settings"}>
              <MdOutlineSettings size={20} />
            </Link> */}
            <Tooltip label="Logout">
              <Button size={"xs"} onClick={logout}>
                <FiLogOut size={20} />
              </Button>
            </Tooltip>
          </Flex>
        )}
      </Flex>
    </>
  );
};
