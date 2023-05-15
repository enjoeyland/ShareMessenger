import {
  TrashIcon,
  HashtagIcon,
  PlusCircleIcon,
  SearchIcon,
} from "@heroicons/react/outline";
import Spinner from "components/Spinner";
// import SelectChannelModal from "components/dashboard/channels/SelectChannelModal";
import { ChannelsContext } from "contexts/ChannelsContext";
import { useModal } from "contexts/ModalContext";
import { useChannelById } from "hooks/useChannels";
import { useWorkspaceById } from "hooks/useWorkspaces";
import { useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { deleteData } from "utils/api-helpers";


function ChannelItem({ channel }: { channel: any }) {
  const { channelId, workspaceId } = useParams();
  const { value: workspace } = useWorkspaceById(workspaceId);
  const [loading, setLoading] = useState(false);


  const unsubscribe = async () => {
    setLoading(true);
    try {
      await deleteData(`/channels/${channel.objectId}/unsubscribe/${channelId}`);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };
  return (
    <li className="px-8 py-2 flex justify-between items-center cursor-pointer group">
      <div className="flex items-center group-hover:w-4/6 w-full">
        <div
          className="rounded p-2 mr-4"
          style={{ backgroundColor: "#f4ede4" }}
        >
          <HashtagIcon className="h-6 w-6" style={{ color: "#4a154b" }} />
        </div>
        <span className="font-bold th-color-for truncate">
          {channel?.name.replace("#", "")}
          {channel?.isArchived && (
            <span className="text-sm opacity-70"> (archived)</span>
          )}
          {workspace?.channelId === channel?.objectId && (
            <span className="text-sm opacity-70"> (default)</span>
          )}
        </span>
      </div>
      <div className="opacity-0 group-hover:opacity-100">
        {loading ? (
          <Spinner className="th-color-for" />
        ) : (
          <TrashIcon
            className="h-6 w-6 th-color-red"
            onClick={unsubscribe}
          />
        )}
      </div>
    </li>
  );
}

export default function SubscribersSection() {
  const { setOpenSelectChannel } = useModal();
  const { channelId } = useParams();
  const { value: channel } = useChannelById(channelId);

  const { value: channels, loading } = useContext(ChannelsContext);

  const [search, setSearch] = useState("");

  const displayChannels = useMemo(
    () =>
      channels
        .filter((ch: any) => {
          return channel?.announcementSubscribers.includes(ch.objectId);
        })
        .reduce((result: any, ch: any) => {
        if (
          ch.name
            .replace("#", "")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          result.push(ch);
        return result;
      }, []),
    [channels, search]
  );

  return (
    <>
      <div className="px-8 w-full">
        <div className="flex items-center border w-full shadow-sm rounded px-2 th-color-for th-bg-bg th-border-selbg">
          <SearchIcon className="h-5 w-5 th-color-for" />
          <input
            type="text"
            name="findMembers"
            id="findMembers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find channels"
            className="block text-base border-0 w-full focus:outline-none focus:ring-0 th-bg-bg"
          />
        </div>
      </div>
      {loading && !channels ? (
        <div className="flex items-center justify-center px-5">
          <Spinner className="h-6 w-6 th-color-for" />
        </div>
      ) : (
        <ul
          className="w-full mt-6 overflow-y-scroll"
          style={{ height: "460px" }}
        >
          <li
            className="px-8 py-2 flex items-center cursor-pointer"
            onClick={() => {
              setOpenSelectChannel(true);
            }}
          >
            <div className="rounded p-2 mr-4">
              <PlusCircleIcon className="h-6 w-6 th-color-for" />
            </div>
            <span className="font-bold th-color-for">Create channel</span>
          </li>
          {displayChannels?.map((channel: any) => (
            <ChannelItem channel={channel} key={channel?.objectId} />
          ))}
        </ul>
      )}
      {/* <SelectChannelModal purpose="subscribe" /> */}
    </>
  );
}
