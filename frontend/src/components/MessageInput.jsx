import { Flex, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import {
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { BsFillImageFill } from "react-icons/bs";
import { usePreviewImg } from "../hooks/usePreviewImg";

const MessageInput = ({ setMessages }) => {
  const showToast = useShowToast();
  const [messageText, setMessageText] = useState("");
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  // const setConversations = useSetRecoilState(conversationsAtom);
  const [conv, setConv] = useRecoilState(conversationsAtom);
  const imageRef = useRef();
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
    if (!messageText && !imgUrl) return;
    try {
      const res = await fetch(`/api/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
      }

      setMessages((messages) => [...messages, data]);
      setConv((prevConvs) => {
        const updatedConvs = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConvs;
      });
      setMessageText("");
      setImgUrl(""); // close modal
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Flex gap={2} alignItems={"center"}>
        <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
          <InputGroup>
            <Input
              w={"full"}
              placeholder="Type a Message"
              onChange={(e) => setMessageText(e.target.value)}
              value={messageText}
            />
            <InputRightElement onClick={handleSendMessage}>
              <IoSendSharp style={{ cursor: "pointer" }} />
            </InputRightElement>
          </InputGroup>
        </form>
        <Flex flex={5} cursor={"pointer"}>
          <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
          <Input
            type={"file"}
            hidden
            ref={imageRef}
            onChange={handleImageChange}
          />
        </Flex>
        <Modal
          isOpen={imgUrl}
          onClose={() => {
            onClose();
            setImgUrl("");
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex mt={5} w={"full"}>
                <Image src={imgUrl} />
              </Flex>
              <Flex justifyContent={"flex-end"} my={2}>
                {!isSending ? (
                  <IoSendSharp
                    size={24}
                    cursor={"pointer"}
                    onClick={handleSendMessage}
                  />
                ) : (
                  <Spinner size={"md"} />
                )}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </>
  );
};

export default MessageInput;
