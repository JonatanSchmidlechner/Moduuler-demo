import { duplicateElement } from "@/redux/productEditorSlice";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

type ContextMenuProps = {
  xCoordinate: number;
  yCoordinate: number;
  clickedElementId: string;
  onRenameButtonClick: () => void;
  onRemoveButtonClick: () => void;
};

const ContextMenu = ({
  xCoordinate,
  yCoordinate,
  clickedElementId: elementId,
  onRenameButtonClick,
  onRemoveButtonClick,
}: ContextMenuProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleDuplicate = () => {
    dispatch(duplicateElement({ elementId }));
  };

  return (
    <Paper
      style={{
        position: "absolute",
        top: yCoordinate,
        left: xCoordinate,
        backgroundColor: "rgba(255, 255, 255, 1)",
        zIndex: 1,
      }}
    >
      <MenuList>
        <MenuItem onClick={onRemoveButtonClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("removeButton")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("duplicateButton")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={onRenameButtonClick}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("renameButton")}</ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
};

export default ContextMenu;
