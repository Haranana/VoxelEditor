import "./menu-bar.css";
import { CheckboxItem, Content, Item, ItemIndicator, Menu, Portal, RadioGroup, RadioItem, Root, Separator, Sub, SubContent, SubTrigger, Trigger } from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, PlayCircleIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

const RADIO_ITEMS = ["Andy", "Benoît", "Luis"];
const CHECK_ITEMS = ["Always Show Bookmarks Bar", "Always Show Full URLs"];

export default function Menubar(){
	const [checkedSelection, setCheckedSelection] = useState([
		CHECK_ITEMS[1],
	]);
	const [radioSelection, setRadioSelection] = useState(RADIO_ITEMS[2]);

	return (
		<Root className="MenubarRoot">
			<Menu>
				<Trigger className="MenubarTrigger">File</Trigger>
				<Portal>
					<Content
						className="MenubarContent"
						align="start"
						sideOffset={5}
						alignOffset={-3}
					>
						<Item className="MenubarItem MenubarContentRowItem MenubarContentRowItemShortcut">
							New Scene <div className="RightSlot">ctrl + c</div>
						</Item>
						<Separator className="MenubarSeparator" />
                        <Sub >
							<SubTrigger className="MenubarSubTrigger MenubarContentRowItem MenubarContentRowItemShortcut">
								Export Scene
								<div className="RightSlot MenubarIconSlot">
									<ChevronRightIcon className="MenubarIcon"/>
								</div>
							</SubTrigger>
							<Portal>
								<SubContent
									className="MenubarSubContent"
									alignOffset={-5}
								>
									<Item className="MenubarItem MenubarContentRowItem">
										.vox
									</Item>
									<Item className="MenubarItem MenubarContentRowItem">
                                        .obj
                                    </Item>
									<Item className="MenubarItem MenubarContentRowItem">
                                        .gltf
                                    </Item>
								</SubContent>
							</Portal>
						</Sub>
						<Item className="MenubarItem MenubarContentRowItem">
							ImportScene <div className="RightSlot"></div>
						</Item>
					</Content>
				</Portal>
			</Menu>

			<Menu>
				<Trigger className="MenubarTrigger">Edit</Trigger>
				<Portal>
					<Content
						className="MenubarContent"
						align="start"
						sideOffset={5}
						alignOffset={-3}
					>
						<Item className="MenubarItem MenubarContentRowItem MenubarContentRowItemShortcut">
							Undo <div className="RightSlot">ctrl + z</div>
						</Item>
						<Item className="MenubarItem MenubarContentRowItem MenubarContentRowItemShortcut">
							Redo <div className="RightSlot">ctrl + y</div>
						</Item>					
					</Content>
				</Portal>
			</Menu>

			<Menu>
				<Trigger className="MenubarTrigger">View</Trigger>
				<Portal>
					<Content
						className="MenubarContent"
						align="start"
						sideOffset={5}
						alignOffset={-14}
					>						
						<Item className="MenubarItem inset MenubarContentRowItem">
							Lorem Ipsum
						</Item>
					</Content>
				</Portal>
			</Menu>

			<Menu>
				<Trigger className="MenubarTrigger">Image</Trigger>
				<Portal>
					<Content
						className="MenubarContent"
						align="start"
						sideOffset={5}
						alignOffset={-14}
					>
						
                        <Separator className="MenubarSeparator" />
                        <Item className="MenubarItem inset MenubarContentRowItem">
                            Lorem Ipsum
                            </Item>
                        <Separator className="MenubarSeparator" />
                        <Item className="MenubarItem inset MenubarContentRowItem">
                            Lorem Ipsum
                        </Item>
					</Content>
				</Portal>
			</Menu>
		</Root>
	);
};
