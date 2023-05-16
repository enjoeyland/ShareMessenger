import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { useModal } from "contexts/ModalContext";
import { useTheme } from "contexts/ThemeContext";
import { Fragment, useRef } from "react";
import SelectChannelSection from "components/dashboard/channels/SelectChannelSection";


export default function SelectChannelModal({
  filter,
  onClick
}: {
  filter: any,
  onClick: any
}) {
  const { themeColors } = useTheme();
  const cancelButtonRef = useRef(null);
  const { openSelectChannel: open, setOpenSelectChannel: setOpen } =
    useModal();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        open={open}
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              style={{ backgroundColor: themeColors?.background }}
              className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div
                style={{ backgroundColor: themeColors?.background }}
                className=" p-6 pb-4 flex justify-between items-center"
              >
                <h5
                  style={{ color: themeColors?.foreground }}
                  className="font-bold text-2xl"
                >
                  Select channel
                </h5>
                <div
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer focus:outline-none"
                  onClick={() => setOpen(false)}
                >
                  <XIcon
                    style={{ color: themeColors?.foreground }}
                    className="h-5 w-5"
                  />
                </div>
              </div>
              <div
                className="pt-10 pb-8"
                style={{ backgroundColor: themeColors?.background }}
              >
                  <SelectChannelSection filter={filter} onClick={onClick}/>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
