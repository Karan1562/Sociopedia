import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

export const ChatPage = () => {
  const showToast = useShowToast();
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [searchText, setSearchText] = useState("");
  const [searchimgUser, setSearchingUser] = useState(false);
  const currentUser = useRecoilValue(userAtom);
  const { socket, onlineUsers } = useSocket();

  const handleConversationSearch = async (e) => {
    useEffect(() => {
      socket?.on("messagesSeen", ({ conversationId }) => {
        setConversations((prev) => {
          const updatedConversations = prev.map((conversation) => {
            if (conversation._id === conversationId) {
              return {
                ...conversation,
                lastMessage: {
                  ...conversation.lastMessage,
                  seen: true,
                },
              };
            }
            return conversation;
          });
          return updatedConversations;
        });
      });
    }, [socket, setConversations]);
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      // if user is trying to find himself
      if (searchedUser._id === currentUser._id) {
        showToast("Error", "You cannot Message yourself", "error");
        return;
      }
      // if user is already in a conversation with the searched user
      if (
        conversations.find(
          (conversation) =>
            conversation.participants[0]._id === searchedUser._id
        )
      ) {
        setSelectedConversation({
          _id: conversations.find(
            (conversation) =>
              conversation.participants[0]._id === searchedUser._id
          )._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await fetch("/api/message/conversations");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };
    getConversation();
  }, [showToast, setConversations]);

  return (
    <>
      <Box
        position={"absolute"}
        left={"50%"}
        w={{ lg: "750px", md: "80%", base: "100%" }}
        transform={"translateX(-50%)"}
        p={4}
      >
        <Flex
          gap={4}
          flexDirection={{
            base: "column",
            md: "row",
          }}
          maxW={{
            sm: "400px",
            md: "full",
          }}
          mx={"auto"}
        >
          <Flex
            flex={30}
            gap={2}
            flexDirection={"column"}
            maxW={{ sm: "250px", md: "full" }}
            mx={"auto"}
          >
            <Text
              fontWeight={700}
              color={useColorModeValue("gray.600", "gray.400")}
            >
              Your Conversations
            </Text>
            <form onSubmit={handleConversationSearch}>
              <Flex alignItems={"center"} gap={2}>
                <Input
                  placeholder="Search for a user"
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />
                <Button size={"sm"} type="submit" isLoading={searchimgUser}>
                  <SearchIcon />
                </Button>
              </Flex>
            </form>

            {loadingConversations &&
              [0, 1, 2, 3, 4].map((_, i) => (
                <Flex
                  key={i}
                  gap={4}
                  alignItems={"center"}
                  p={"1"}
                  borderRadius={"md"}
                >
                  <Box>
                    <SkeletonCircle size={"10"} />
                  </Box>
                  <Flex w={"full"} flexDirection={"column"} gap={3}>
                    <Skeleton h={"10px"} w={"80px"} />
                    <Skeleton h={"8px"} w={"90%"} />
                  </Flex>
                </Flex>
              ))}
            {!loadingConversations &&
              conversations.map((conversation) => (
                <Conversation
                  isOnline={onlineUsers.includes(
                    conversation.participants[0]._id
                  )}
                  key={conversation?._id}
                  conversation={conversation}
                />
              ))}
          </Flex>
          {!selectedConversation?._id && (
            <Flex
              flex={70}
              borderRadius={"md"}
              p={2}
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              height={"400px"}
            >
              <GiConversation size={100} />
              <Text fontSize={20}>
                Select a conversation to start messaging
              </Text>
            </Flex>
          )}
          {selectedConversation?._id && <MessageContainer />}

          {/* <Flex flex={70}>MessageContainer</Flex> */}
        </Flex>
      </Box>
    </>
  );
};
