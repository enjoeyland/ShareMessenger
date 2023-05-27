import { 
  SearchIcon,
  HashtagIcon,
  ChevronDownIcon,
  FilterIcon as FilterOutlineIcon } from "@heroicons/react/outline";
import { FilterIcon as FilterSolidIcon } from "@heroicons/react/solid";
import EditChannel from "components/dashboard/channels/EditChannel";
import Editor from "components/dashboard/chat/Editor";
import Messages from "components/dashboard/chat/Messages";
import { useTheme } from "contexts/ThemeContext";
import { UserContext, useUser } from "contexts/UserContext";
import { useChannelById } from "hooks/useChannels";
import { useDetailByChat } from "hooks/useDetails";
import { useDirectMessageById } from "hooks/useDirects";
import { useUserById } from "hooks/useUsers";
import { Fragment, useContext, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { postData } from "utils/api-helpers";
import { getHref } from "utils/get-file-url";
import { Menu, Transition } from "@headlessui/react";
import Spinner from "components/Spinner";
import { useMessagesByChat } from "hooks/useMessages";
import { useWorkspaceById } from "hooks/useWorkspaces";
import { ChannelsContext } from "contexts/ChannelsContext";
import classNames from "utils/classNames";
import { FilterContext } from "contexts/FilterContext";

const SelectButton = styled.button`
  :hover {
    background-color: ${(props) => props.theme.selectionBackground};
  }
`;
const FilterItemDiv = styled.div`
  :hover {
    background-color: ${(props) => props.theme.selectionBackground};
  }
`;

function FilterItem({channel}:{channel:any}) {
  const { channelId, workspaceId } = useParams();
  const { value: workspace } = useWorkspaceById(workspaceId);
  const { themeColors } = useTheme();
  const { setFilterType, setFilter } = useContext(FilterContext);

  const isCurrent = channelId === channel.objectId;

  return ( 
      <div className="px-8 py-2 flex justify-between items-center cursor-pointer group">
        <FilterItemDiv
          className="flex items-center group-hover:w-4/6 w-full"
          onClick={()=>{setFilterType("channel_announcement"); setFilter(channel);}}
          theme={themeColors}
        >
          <div
            className="rounded p-2 mr-4"
            style={{ backgroundColor: "#f4ede4" }}
          >
            <HashtagIcon className="h-6 w-6" style={{ color: "#4a154b" }} />
          </div>
          <span className="font-bold th-color-for truncate">
            {channel?.name.replace("#", "")}
            {isCurrent && (
              <span className="font-normal opacity-70 ml-1 th-color-for">
                (current)
              </span>
            )}
            {channel?.isArchived && (
              <span className="text-sm opacity-70"> (archived)</span>
            )}
            {workspace?.channelId === channel?.objectId && (
              <span className="text-sm opacity-70"> (default)</span>
            )}
          </span>
        </FilterItemDiv>
      </div>

  );
}

function MessageFilterSelectMenu({open}:{open:boolean}) {
  const { channelId } = useParams();
  const { value: channel } = useChannelById(channelId);
  const { themeColors } = useTheme();
  
  // const { value: messages, loading } = useMessagesByChat(channelId);
  const [search, setSearch] = useState("");
  
  const { value: channels, loading } = useContext(ChannelsContext);
  const { setFilterType, setFilter } = useContext(FilterContext);

  const displayChannels = useMemo(
    () =>
      channels
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

  // const ids = useMemo(
  //   () => 
  //     messages.reduce((result: any, msg: any) => {
  //       if (msg.announcementChannelId && !result.includes(msg.announcementChannelId)) 
  //         result.push(msg.announcementChannelId);
  //       return result;
  //     }),
  //     [messages]
  // );
  // const { value: announcementChannels } = useChannelsById(ids);

  // const displayAnnouncementChannels = useMemo(
  //   () =>
  //     announcementChannels.reduce((result: any, ch: any) => {
  //       if (
  //         ch.name
  //           .replace("#", "")
  //           .toLowerCase()
  //           .includes(search.toLowerCase())
  //       )
  //         result.push(ch);
  //       return result;
  //     }, []),
  //   [search]
  // );

  return (
    <Transition
      show={open}
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        static
        className="th-bg-bg border th-border-selbg origin-top-right z-10 absolute right-0 mt-2 w-72 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none py-3"
      >
        <div className="px-8 w-full">
          <div className="flex items-center border w-full shadow-sm rounded px-2 th-color-for th-bg-bg th-border-selbg">
            <SearchIcon className="h-5 w-5 th-color-for" />
            <input
              type="text"
              name="findMembers"
              id="findMembers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find Publisher"
              className="block text-base border-0 w-full focus:outline-none focus:ring-0 th-bg-bg"
            />
          </div>
        </div>
        <div className="w-full">
          <div className="px-8 py-2 flex justify-between items-center cursor-pointer group">
            <FilterItemDiv
              className="flex items-center group-hover:w-4/6 w-full"
              onClick={()=>{setFilterType(null); setFilter(null);}}
              theme={themeColors}
            >
              <span className="font-bold th-color-for truncate">
                {"clear filter"}
              </span>
            </FilterItemDiv>
          </div>
        </div>
        {loading && !channels ? (
          <div className="flex items-center justify-center px-5">
            <Spinner className="h-6 w-6 th-color-for" />
          </div>
        ):
          <div className="w-full">
            <div className="px-8 py-2 flex justify-between items-center cursor-pointer group">
              <FilterItemDiv
                className="flex items-center group-hover:w-4/6 w-full"
                onClick={()=>{setFilterType("channel_announcement"); setFilter("");}}
                theme={themeColors}
              >
                <span className="font-bold th-color-for truncate">
                  {"normal messages"}
                </span>
              </FilterItemDiv>
            </div>
            {displayChannels?.map((channel: any) => (
              <FilterItem channel={channel} key={channel?.objectId}/>
            ))}
          </div>
        }
      </Menu.Items>

    </Transition>
  );
}

function HeaderChannel() {
  const { themeColors } = useTheme();
  const [openEditChannel, setOpenEditChannel] = useState(false);
  const { channelId } = useParams();
  const { value } = useChannelById(channelId);
  const { filteredBy } = useContext(FilterContext);

  return (
    <div className="w-full border-b flex justify-between items-center px-5 py-1 h-14 th-color-selbg th-border-selbg">
      <SelectButton
        className="flex items-center cursor-pointer focus:outline-none py-1 px-2 rounded"
        onClick={() => setOpenEditChannel(true)}
        theme={themeColors}
      >
        <div className="font-bold text-lg mr-1 th-color-for max-w-sm truncate">
          {`#${value?.name || ""}`}
        </div>
        <ChevronDownIcon className="h-4 w-4 th-color-for" />
      </SelectButton>
      {value?.topic && (
        <span className="ml-3 text-sm th-color-for opacity-70">
          {value?.topic}
        </span>
      )}
      <EditChannel
        open={openEditChannel}
        setOpen={setOpenEditChannel}
        name={value?.name}
        topic={value?.topic}
        details={value?.details}
        createdAt={new Date(value?.createdAt)?.toDateString()}
      />

      <div className="flex items-center justify-end">
        <Menu as="div" className="relative">
          {({ open }) => (
            <>
              <div>
                <Menu.Button
                  as="div"
                  className="relative mr-2 cursor-pointer appearance-none"
                >
                  {filteredBy===null &&
                    <FilterOutlineIcon className="h-6 w-6 th-color-for"/>
                  }
                  {filteredBy!==null &&
                    <FilterSolidIcon className="h-6 w-6 th-color-for"/>
                  }
                </Menu.Button>
              </div>
              <MessageFilterSelectMenu open={open}/>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
}

function HeaderDirectMessage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColors } = useTheme();
  const { dmId } = useParams();
  const { value: dm } = useDirectMessageById(dmId);
  const { user } = useUser();
  const otherUserId = dm?.members.find((m: string) => m !== user?.uid);
  const { value } = useUserById(otherUserId || user?.uid);

  const photoURL = getHref(value?.thumbnailURL) || getHref(value?.photoURL);

  return (
    <div className="w-full border-b flex items-center justify-between px-5 py-1 h-14 th-color-selbg th-border-selbg">
      <SelectButton
        className="flex items-center cursor-pointer focus:outline-none py-1 px-2 rounded"
        onClick={() =>
          navigate(
            `${location.pathname.split("/user_profile")[0]}/user_profile/${
              value?.objectId
            }`
          )
        }
        theme={themeColors}
      >
        <img
          alt={value?.objectId}
          className="h-6 w-6 rounded mr-2"
          src={photoURL || `${process.env.PUBLIC_URL}/blank_user.png`}
        />
        <div className="font-bold text-lg mr-1 th-color-for max-w-sm truncate">
          {value?.displayName}
        </div>
        <ChevronDownIcon className="h-4 w-4 th-color-for" />
      </SelectButton>
    </div>
  );
}

export default function ChatArea() {
  const { user } = useUser();
  const { channelId, dmId } = useParams();
  const { value: channel } = useChannelById(channelId);
  const { value: directMessage } = useDirectMessageById(dmId);
  const { value: detail } = useDetailByChat(channelId || dmId);

  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    const el = document.getElementById("messages")!;
    el.scrollTo(el.scrollHeight, 0);
    setLastRead(null);
    setHasNew(false);
  }, [channelId, dmId]);

  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (channel && channel.lastMessageCounter !== detail?.lastRead) {
      postData(`/users/${user?.uid}/read`, {
        chatType: "Channel",
        chatId: channelId,
      });
      if (!hasNew) {
        setLastRead(detail?.lastRead || 0);
        setHasNew(true);
      }
    } else if (
      directMessage &&
      directMessage.lastMessageCounter !== detail?.lastRead
    ) {
      postData(`/users/${user?.uid}/read`, {
        chatType: "Direct",
        chatId: dmId,
      });
      if (!hasNew) {
        setLastRead(detail?.lastRead || 0);
        setHasNew(true);
      }
    }
  }, [channel?.lastMessageCounter, directMessage?.lastMessageCounter]);

  return (
    <div className="row-span-2 flex flex-col overflow-hidden">
      {channelId && <HeaderChannel />}
      {dmId && <HeaderDirectMessage />}
      <div className="min-h-0 flex-1 flex flex-col justify-end overflow-y-auto">
        <Messages lastRead={lastRead} />
        <Editor />
      </div>
    </div>
  );
}
