import Message from "components/dashboard/chat/Message";
import Spinner from "components/Spinner";
import { MESSAGES_PER_PAGE } from "config";
import { FilterContext } from "contexts/FilterContext";
import { useUser } from "contexts/UserContext";
import { useChannelById } from "hooks/useChannels";
import { useDirectMessageById } from "hooks/useDirects";
import { useMessagesByChat } from "hooks/useMessages";
import { useContext, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useParams } from "react-router-dom";

export default function Messages({ lastRead }: { lastRead: number | null }) {
  const { channelId, dmId } = useParams();
  const { filterType, filteredBy } = useContext(FilterContext);

  const [page, setPage] = useState(1);
  const { value: messages, loading } = useMessagesByChat(
    channelId || dmId,
    page
  );

  const [editMessage, setEditMessage] = useState("");

  const { user } = useUser();
  const { value: channel } = useChannelById(channelId);
  const { value: direct } = useDirectMessageById(dmId);

  const chat = channel || direct;

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) setPage(page + 1);
  }, [inView]);

  useEffect(() => {
    setPage(1);
  }, [channelId, dmId]);

  const filteredMessage = useMemo(()=>{
    if (filteredBy === null) {
      return messages;
    } else {
      return messages.filter((msg: any) => {
        if (filterType === "channel_announcement" && filteredBy === "") {
          return msg.isAnnouncement === false;
        } else if (filterType === "channel_announcement") {
          return msg.announcementChannelId === filteredBy.objectId;
        } else if (filterType === "message_report") {
          return msg.reportId === filteredBy.objectId;
        } else {
          return true;
        }
      })
    }
  }, [messages]);

  return <>
    <div
      className="w-full flex flex-1 flex-col-reverse overflow-y-auto pt-1"
      id="messages"
    >
      {filteredMessage?.map((message: any, index: number) => (
        <Message
          key={message?.objectId}
          index={index}
          message={message}
          previousSameSender={
            index !== filteredMessage?.length
              ? filteredMessage[index + 1]?.senderId === message?.senderId
              : false
          }
          previousMessageDate={filteredMessage[index + 1]?.createdAt}
          editMessage={editMessage}
          setEditMessage={setEditMessage}
        >
          {lastRead !== null &&
            lastRead + 1 === message?.counter &&
            chat &&
            lastRead !== chat?.lastMessageCounter &&
            message?.senderId !== user?.uid && (
              <div className="flex w-full items-center">
                <div className="h-px w-full my-3 th-bg-brred" />
                <div className="font-medium text-sm mx-3 th-color-brred">
                  New
                </div>
              </div>
            )}
        </Message>
      ))}
      {loading && filteredMessage?.length === 0 && (
        <div className="flex w-full items-center py-10 justify-center">
          <Spinner />
        </div>
      )}
      {!loading &&
        filteredMessage?.length > 0 &&
        filteredMessage?.length === page * MESSAGES_PER_PAGE && (
          <div ref={ref} className="opacity-0 w-full" />
        )}
    </div>
  </>;
}
