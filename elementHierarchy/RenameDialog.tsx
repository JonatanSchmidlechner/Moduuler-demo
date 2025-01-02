import { renameElement } from "@/redux/productEditorSlice";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import style from "./ElementHierarchy.module.scss";
export type RenameDialogProps = {
  clickedElementId: string;
  isOpen: boolean;
  handleRenameClose: () => void;
};

const RenameDialog = ({
  isOpen,
  clickedElementId: elementId,
  handleRenameClose,
}: RenameDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newName = formData.get("name") as string;
    newName && dispatch(renameElement({ elementId, name: newName }));
    handleRenameClose();
  };

  return (
    <>
      <Dialog
        className={style.dialog}
        open={isOpen}
        onClose={handleRenameClose}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            handleSubmit(event);
          },
        }}
      >
        <DialogTitle>{t("renameDialogTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("renameDialogContent")}</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            name="name"
            label={t("renameDialogLabel")}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRenameClose}
            className={style["cancel-button"]}
          >
            {t("cancelButton")}
          </Button>
          <Button type="submit" className={style["accept-button"]}>
            {t("confirmButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default RenameDialog;
