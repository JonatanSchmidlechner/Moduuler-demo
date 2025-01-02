import ElementIcon from "@/App/Icons/ElementIcon";
import Model3dIcon from "@/App/Icons/Model3dIcon";
import ProductIcon from "@/App/Icons/ProductIcon";
import ContextMenu from "@/ElementHierarchy/ContextMenu";
import RenameDialog from "@/ElementHierarchy/RenameDialog";
import {
  Element,
  ProductElement,
  isModelElement,
  isPlaceholderElement,
  isProductElement,
} from "@/api/types";
import BasicDialog from "@/common/BasicDialog";
import PanelHeader from "@/common/PanelHeader";
import {
  addExpandedElementId,
  addSelectedElementId,
  clearSelectedElementIds,
  moveElement,
  removeElement,
  removeExpandedElementId,
  removeSelectedElementId,
  selectExpandedElementIds,
  selectLoadingStatus,
  selectRootProduct,
  selectRootProductId,
  selectSelectedElementIds,
  selectSelectedElements,
  selectTopSelectedElement,
} from "@/redux/productEditorSlice";
import { useAppDispatch } from "@/redux/store";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography, alpha, styled } from "@mui/material";
import {
  TreeItem,
  TreeItemContentProps,
  TreeItemProps,
  TreeView,
  useTreeItem,
} from "@mui/x-tree-view";
import clsx from "clsx";
import React, {
  DragEvent,
  MouseEvent,
  Ref,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const ElementHierarchy = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const rootProduct = useSelector(selectRootProduct);
  const loadingStatus = useSelector(selectLoadingStatus);
  const selectedElementIds = useSelector(selectSelectedElementIds);
  const selectedElements = useSelector(selectSelectedElements);
  const expandedElementIds = useSelector(selectExpandedElementIds);
  const topSelectedElement = useSelector(selectTopSelectedElement);
  const loadedProductId = useSelector(selectRootProductId);
  const hasExpanded = useRef(false);
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    visible: boolean;
    clickedElementId: string;
  }>({ x: 0, y: 0, visible: false, clickedElementId: rootProduct?.elementId });
  const [renameTextFieldState, setRenameTextFieldState] = useState(false);

  // This is implemented according to the example in the MUI documentation found here:
  // https://v6.mui.com/x/react-tree-view/#contentcomponent-prop.
  const CustomContentRoot = styled("div")(({ theme }) => ({
    "&&:hover, &&.Mui-disabled, &&.Mui-focused, &&.Mui-selected, &&.Mui-selected.Mui-focused, &&.Mui-selected:hover":
      {
        backgroundColor: "transparent",
      },
    ".MuiTreeItem-contentBar": {
      position: "absolute",
      width: "100%",
      height: "1.5rem",
      left: 0,
    },
    "&:hover .MuiTreeItem-contentBar": {
      backgroundColor: theme.palette.surface.main,
    },
    "&.Mui-selected .MuiTreeItem-contentBar": {
      backgroundColor: theme.palette.primary.main,
    },
    "&.Mui-selected:hover .MuiTreeItem-contentBar": {
      backgroundColor: alpha(
        theme.palette.primary.main,
        0.6 + theme.palette.action.hoverOpacity,
      ),
    },
  }));

  // This is implemented according to the example in the MUI documentation found here:
  // https://v6.mui.com/x/react-tree-view/#contentcomponent-prop.
  const CustomContent = forwardRef(function CustomContent(
    props: TreeItemContentProps,
    ref: Ref<HTMLDivElement>,
  ) {
    const {
      classes,
      className,
      label,
      nodeId,
      icon: iconProp,
      expansionIcon,
      displayIcon,
    } = props;

    const { disabled, expanded, selected, focused, preventSelection } =
      useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      preventSelection(event);
    };

    const handleExpansionClick = () => {
      if (expandedElementIds.includes(nodeId)) {
        dispatch(removeExpandedElementId(nodeId));
      } else {
        dispatch(addExpandedElementId(nodeId));
      }
    };

    const handleSelectionClick = (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      const isElementAlreadySelected = selectedElementIds.includes(nodeId);
      const isTopSelectedClicked = topSelectedElement?.elementId === nodeId;

      dispatch(clearSelectedElementIds());

      if (!isElementAlreadySelected || !isTopSelectedClicked) {
        dispatch(addSelectedElementId(nodeId));
      }
    };

    return (
      <CustomContentRoot
        className={clsx(className, classes.root, {
          "Mui-expanded": expanded,
          "Mui-selected": selected,
          "Mui-focused": focused,
          "Mui-disabled": disabled,
        })}
        onMouseDown={handleMouseDown}
        ref={ref}
      >
        <div
          onClick={handleExpansionClick}
          className={classes.iconContainer}
          style={{ zIndex: 1 }} // Make the icon be on top of the content bar
        >
          {icon}
        </div>
        <div
          onClick={handleSelectionClick}
          className="MuiTreeItem-contentBar"
        />
        <Typography
          onClick={handleSelectionClick}
          component="div"
          className={classes.label}
        >
          {label}
        </Typography>
      </CustomContentRoot>
    );
  });

  // This is implemented according to the example in the MUI documentation found here:
  // https://v6.mui.com/x/react-tree-view/#contentcomponent-prop.
  const CustomTreeItem = forwardRef(function CustomTreeItem(
    props: TreeItemProps,
    ref: Ref<HTMLLIElement>,
  ) {
    return <TreeItem ContentComponent={CustomContent} {...props} ref={ref} />;
  });

  useEffect(() => {
    const expandInitialProduct = (element: Element, isRoot: boolean) => {
      if (isRoot) {
        (element as ProductElement).constituentChildren &&
          dispatch(addExpandedElementId(element.elementId));

        (element as ProductElement).constituentChildren.forEach((child) => {
          expandInitialProduct(child, false);
        });
      }

      element.children && dispatch(addExpandedElementId(element.elementId));
      element.children.forEach((child) => {
        expandInitialProduct(child, false);
      });
    };

    if (rootProduct && !hasExpanded.current) {
      expandInitialProduct(rootProduct, true);
      hasExpanded.current = true;
    }
  }, [loadedProductId]);

  const handleDragStart = (
    event: DragEvent<HTMLElement>,
    elementId: string,
  ) => {
    event.stopPropagation();
    event.dataTransfer.setData("draggedHierarchyElementId", elementId);
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDragDrop = (
    event: DragEvent<HTMLElement>,
    dropTargetId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const draggedHierarchyElementId = event.dataTransfer.getData(
      "draggedHierarchyElementId",
    );

    const isRootMoved = draggedHierarchyElementId === "";

    if (isRootMoved) {
      return;
    }
    dispatch(removeSelectedElementId(draggedHierarchyElementId));
    dispatch(
      moveElement({
        elementId: draggedHierarchyElementId,
        newParentId: dropTargetId,
      }),
    );

    dispatch(addExpandedElementId(dropTargetId));
  };

  const handleRightClick = (event: MouseEvent, elementId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuState({
      x: event.clientX,
      y: event.clientY,
      visible: true,
      clickedElementId: elementId,
    });
    dispatch(clearSelectedElementIds());
    dispatch(addSelectedElementId(elementId));
  };

  const [multiDeleteDialogState, setMultiDeleteDialogState] = useState(false);

  const handleRenameButtonClick = () => {
    setContextMenuState((prevState) => ({ ...prevState, visible: false }));
    setRenameTextFieldState(true);
  };

  const handleDeleteButtonClick = () => {
    setContextMenuState((prevState) => ({ ...prevState, visible: false }));
    const isMultiDeletion = selectedElementIds.length > 1;

    if (isMultiDeletion) {
      setMultiDeleteDialogState(true);
    } else {
      dispatch(removeElement({ elementId: contextMenuState.clickedElementId }));
    }
  };

  useEffect(() => {
    const handleWindowClick = () => {
      setContextMenuState((prevState) => ({ ...prevState, visible: false }));
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  const LabelComponent = ({
    Icon,
    displayName,
    isDragIndicator,
  }: {
    Icon: React.FC | undefined;
    displayName: string;
    isDragIndicator: boolean;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        left: "0",
        width: "100%",
      }}
    >
      {Icon && <Icon />}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: "8px", marginLeft: "8px" }}>
          {displayName}
        </span>
        {isDragIndicator && <DragIndicatorIcon />}
      </div>
    </div>
  );

  const renderHierarchy = (element: Element) => {
    const { elementId, displayName, children } = element;

    let Icon: React.FC | undefined = undefined;
    if (isProductElement(element)) {
      Icon = ProductIcon;
    } else if (isPlaceholderElement(element)) {
      Icon = ElementIcon;
    } else if (isModelElement(element)) {
      Icon = Model3dIcon;
    }

    return (
      <CustomTreeItem
        key={elementId}
        nodeId={elementId}
        label={LabelComponent({
          Icon: Icon,
          displayName: displayName,
          isDragIndicator: true,
        })}
        draggable
        onFocusCapture={(event) => event.stopPropagation()} // Without this does not work. https://github.com/mui/material-ui/issues/29518
        onDragStart={(event) => handleDragStart(event, elementId)}
        onDragOver={(event) => handleDragOver(event)}
        onDrop={(event) => handleDragDrop(event, elementId)}
        onContextMenu={(event) => handleRightClick(event, elementId)}
      >
        {children.map((child) => renderHierarchy(child))}
      </CustomTreeItem>
    );
  };

  const renderRoot = () => {
    const { elementId, displayName, constituentChildren } = rootProduct;

    return (
      <CustomTreeItem
        key={elementId}
        nodeId={elementId}
        label={LabelComponent({
          Icon: ProductIcon,
          displayName: displayName,
          isDragIndicator: false,
        })}
        // Without this does not work. https://github.com/mui/material-ui/issues/29518
        onFocusCapture={(event) => event.stopPropagation()}
        onDragOver={(event) => handleDragOver(event)}
        onDrop={(event) => handleDragDrop(event, elementId)}
      >
        {constituentChildren.map((child) => renderHierarchy(child))}
      </CustomTreeItem>
    );
  };

  if (loadingStatus === "loading") {
    return <div>{t("loading")}</div>;
  }

  if (!rootProduct) {
    return <div>{t("product404")}</div>;
  }
  const selectedElementDisplayNameString = selectedElements
    .map((element) => element.displayName)
    .join(", ");

  return (
    <>
      <PanelHeader title={t("elementHierarchyTitle")} />
      <TreeView
        multiSelect={true}
        selected={selectedElementIds}
        expanded={expandedElementIds}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ position: "relative" }}
      >
        {renderRoot()}
      </TreeView>
      {contextMenuState.visible && (
        <ContextMenu
          xCoordinate={contextMenuState.x}
          yCoordinate={contextMenuState.y}
          clickedElementId={contextMenuState.clickedElementId}
          onRenameButtonClick={handleRenameButtonClick}
          onRemoveButtonClick={handleDeleteButtonClick}
        />
      )}
      <RenameDialog
        clickedElementId={contextMenuState.clickedElementId}
        isOpen={renameTextFieldState}
        handleRenameClose={() => setRenameTextFieldState(false)}
      />
      <BasicDialog
        isOpen={multiDeleteDialogState}
        onClose={() => setMultiDeleteDialogState(false)}
        title={t("multiDeleteDialogTitle")}
        content={t("multiDeleteDialogContent", {
          selectedElementIds: selectedElementDisplayNameString,
        })}
        buttons={[
          {
            label: t("cancelButton"),
            onClick: () => setMultiDeleteDialogState(false),
            className: "neutral-button",
          },
          {
            label: t("confirmButton"),
            onClick: () => {
              dispatch(
                removeElement({ elementId: contextMenuState.clickedElementId }),
              );
              setMultiDeleteDialogState(false);
            },
            className: "destructive-button",
          },
        ]}
      />
    </>
  );
};

export default ElementHierarchy;
