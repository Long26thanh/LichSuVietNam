import React, { useRef, useState, useEffect } from "react";
import * as icons from "../../assets/icons";
import styles from "./TextEditor.module.css";

const TextEditor = ({
    value,
    onChange,
    placeholder,
    name,
    error,
    type = "simple",
}) => {
    const editorRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    useEffect(() => {
        const preventDefaultLinks = (e) => {
            if (e.target.closest("a")) {
                e.preventDefault();
            }
        };

        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener("click", preventDefaultLinks);
            return () => {
                editor.removeEventListener("click", preventDefaultLinks);
            };
        }
    }, []);

    const handleInput = () => {
        if (editorRef.current && onChange) {
            try {
                const content = editorRef.current.innerHTML;
                onChange({
                    target: {
                        name: name,
                        value: content,
                    },
                });
            } catch (error) {
                console.error("Error in SimpleTextEditor handleInput:", error);
            }
        }
    };

    const handleFocus = () => {
        setIsActive(true);
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsActive(false);
        setIsEditing(false);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (e.target.closest("a")) {
                e.target.closest("a").style.cursor = e.ctrlKey
                    ? "text"
                    : "pointer";
            }
        };

        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener("mousemove", handleMouseMove);
            return () => {
                editor.removeEventListener("mousemove", handleMouseMove);
            };
        }
    }, []);

    const handleClick = (e) => {
        const link = e.target.closest("a");
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            if (!e.ctrlKey && !e.metaKey) {
                window.open(link.href, "_blank", "noopener,noreferrer");
            }
            return;
        }
        // Nếu click vào vùng không phải link, cho phép chỉnh sửa
        setIsReadOnly(false);
        setIsEditing(true);
    };

    const saveSelection = () => {
        if (!editorRef.current) return null;
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        return {
            start,
            end: start + range.toString().length,
            selectedText: range.toString(),
        };
    };

    const restoreSelection = (savedSel) => {
        if (!savedSel || !editorRef.current) return;

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const textContent = editorRef.current.innerText;
        let charIndex = 0;
        let foundStart = false;
        let foundEnd = false;

        const traverseNodes = (node) => {
            if (foundEnd) return;

            if (node.nodeType === 3) {
                const nextCharIndex = charIndex + node.length;
                if (
                    !foundStart &&
                    savedSel.start >= charIndex &&
                    savedSel.start <= nextCharIndex
                ) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (
                    !foundEnd &&
                    savedSel.end >= charIndex &&
                    savedSel.end <= nextCharIndex
                ) {
                    range.setEnd(node, savedSel.end - charIndex);
                    foundEnd = true;
                }
                charIndex = nextCharIndex;
            } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                    traverseNodes(node.childNodes[i]);
                }
            }
        };

        traverseNodes(editorRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const handleImageInsert = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const savedSel = saveSelection();
                        document.execCommand(
                            "insertImage",
                            false,
                            e.target.result
                        );
                        handleInput();
                        if (savedSel) {
                            setTimeout(() => {
                                restoreSelection(savedSel);
                            }, 0);
                        }
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error("Error inserting image:", error);
                }
            }
        };
        input.click();
    };

    const handleLinkInsert = () => {
        const savedSel = saveSelection();
        if (!savedSel || savedSel.end === savedSel.start) {
            alert("Vui lòng chọn văn bản để chèn liên kết");
            return;
        }

        const url = prompt("Nhập địa chỉ liên kết:", "http://");
        if (url) {
            try {
                restoreSelection(savedSel);
                document.execCommand("createLink", false, url);
                handleInput();
            } catch (error) {
                console.error("Error creating link:", error);
            }
        }
    };

    const handleBlockFormat = (button) => {
        const selection = window.getSelection();
        const savedSel = saveSelection();

        try {
            const isBlockquote = button.title === "Chèn trích dẫn";
            const blockTag = isBlockquote ? "blockquote" : "pre";

            // Kiểm tra xem selection hiện tại có trong block không
            let currentBlock = null;
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                currentBlock =
                    range.commonAncestorContainer.nodeType === 1
                        ? range.commonAncestorContainer.closest(blockTag)
                        : range.commonAncestorContainer.parentElement.closest(
                              blockTag
                          );
            }

            // Nếu đã có block, xóa block và chuyển thành text thường
            if (currentBlock) {
                const content = currentBlock.textContent;
                // Nếu block rỗng, xóa hoàn toàn
                if (!content.trim()) {
                    currentBlock.parentNode.removeChild(currentBlock);
                } else {
                    // Tạo text node mới với nội dung đã chỉnh sửa
                    const textNode = document.createTextNode(content);
                    // Thay thế block bằng text
                    currentBlock.parentNode.replaceChild(
                        textNode,
                        currentBlock
                    );
                }
                handleInput();
                return;
            }

            // Xử lý chèn block mới
            if (!savedSel || savedSel.end === savedSel.start) {
                // Chèn block rỗng tại vị trí con trỏ
                if (isBlockquote) {
                    document.execCommand(
                        "insertHTML",
                        false,
                        `<blockquote></blockquote>`
                    );
                } else {
                    document.execCommand(
                        "insertHTML",
                        false,
                        `<pre style="background-color: #f6f8fa; padding: 1rem; border-radius: 4px; font-family: monospace;"></pre>`
                    );
                }

                // Đặt con trỏ vào trong block mới
                const newBlock = editorRef.current.querySelector(
                    `${blockTag}:last-of-type`
                );
                if (newBlock) {
                    const range = document.createRange();
                    range.setStart(newBlock, 0);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                // Áp dụng block cho text đã chọn
                if (isBlockquote) {
                    document.execCommand("formatBlock", false, "<blockquote>");
                } else {
                    document.execCommand("formatBlock", false, "<pre>");
                    const range = selection.getRangeAt(0);
                    const pre =
                        range.commonAncestorContainer.nodeType === 1
                            ? range.commonAncestorContainer.closest("pre")
                            : range.commonAncestorContainer.parentElement.closest(
                                  "pre"
                              );
                    if (pre) {
                        pre.style.backgroundColor = "#f6f8fa";
                        pre.style.padding = "1rem";
                        pre.style.borderRadius = "4px";
                        pre.style.fontFamily = "monospace";
                    }
                }
            }
            handleInput();
        } catch (error) {
            console.error("Error formatting block:", error);
        }
    };

    const execCommand = (command, value = null) => {
        try {
            if (editorRef.current) {
                editorRef.current.focus();

                if (command === "insertImage") {
                    handleImageInsert();
                    return;
                }

                if (command === "createLink") {
                    handleLinkInsert();
                    return;
                }

                if (command === "formatBlock") {
                    const button = formatButtons.find(
                        (btn) =>
                            btn.command === command &&
                            (btn.title === "Chèn trích dẫn" ||
                                btn.title === "Chèn khối mã")
                    );
                    if (button) {
                        handleBlockFormat(button);
                        return;
                    }
                }

                const savedSel = saveSelection();
                document.execCommand("styleWithCSS", false, true);
                document.execCommand(command, false, value);

                // Handle input changes after a short delay
                setTimeout(() => {
                    handleInput();
                    if (savedSel) {
                        restoreSelection(savedSel);
                    }
                }, 0);
            }
        } catch (error) {
            console.error("Error executing command:", command, error);
        }
    };

    const formatButtons = [
        { command: "bold", icon: "B", title: "In đậm", type: "normal" },
        { command: "italic", icon: "I", title: "In nghiêng", type: "normal" },
        { command: "underline", icon: "U", title: "Gạch chân", type: "normal" },
        {
            command: "strikethrough",
            icon: "ab",
            title: "Gạch ngang",
            type: "normal-rich",
        },
        {
            command: "justifyLeft",
            icon: icons.alignLeft,
            title: "Căn trái",
            type: "align",
        },
        {
            command: "justifyCenter",
            icon: icons.alignCenter,
            title: "Căn giữa",
            type: "align",
        },
        {
            command: "justifyRight",
            icon: icons.alignRight,
            title: "Căn phải",
            type: "align",
        },
        {
            command: "justifyFull",
            icon: icons.alignJustify,
            title: "Căn đều",
            type: "align",
        },
        {
            command: "insertUnorderedList",
            icon: icons.listBulleted,
            title: "Danh sách không thứ tự",
            type: "list",
        },
        {
            command: "insertOrderedList",
            icon: icons.listNumbered,
            title: "Danh sách có thứ tự",
            type: "list",
        },
        {
            command: "insertImage",
            icon: icons.imageIcon,
            title: "Chèn hình ảnh",
            type: "insert",
        },
        {
            command: "createLink",
            icon: icons.linkIcon,
            title: "Chèn liên kết",
            type: "insert",
        },
        {
            command: "formatBlock",
            icon: icons.quoteIcon,
            title: "Chèn trích dẫn",
            type: "block",
        },
        {
            command: "formatBlock",
            icon: icons.codeIcon,
            title: "Chèn khối mã",
            type: "block",
        },
    ];

    return (
        <div
            className={`${styles["text-editor"]} ${error ? styles.error : ""} ${
                isActive ? styles.active : ""
            }`}
        >
            <div className={styles["text-editor-toolbar"]}>
                {/* Format buttons (bold, italic, underline) */}
                {formatButtons
                    .filter((button) => button.type === "normal")
                    .map((button) => (
                        <button
                            key={button.command}
                            type="button"
                            className={styles["toolbar-btn"]}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => execCommand(button.command)}
                            title={button.title}
                        >
                            <span className={styles[`icon-${button.command}`]}>
                                {button.icon}
                            </span>
                        </button>
                    ))}

                {type === "rich" &&
                    formatButtons
                        .filter((button) => button.type === "normal-rich")
                        .map((button) => (
                            <button
                                key={button.command}
                                type="button"
                                className={styles["toolbar-btn"]}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => execCommand(button.command)}
                                title={button.title}
                            >
                                <span
                                    className={styles[`icon-${button.command}`]}
                                >
                                    {button.icon}
                                </span>
                            </button>
                        ))}
                {type === "rich" && (
                    <div className={styles["toolbar-divider"]}></div>
                )}

                {/* List buttons */}
                {type === "rich" &&
                    formatButtons
                        .filter((button) => button.type === "list")
                        .map((button) => (
                            <button
                                key={button.command}
                                type="button"
                                className={styles["toolbar-btn"]}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => execCommand(button.command)}
                                title={button.title}
                            >
                                <img
                                    src={button.icon}
                                    alt={button.title}
                                    className={styles.buttonIcon}
                                />
                            </button>
                        ))}
                {type === "rich" && (
                    <div className={styles["toolbar-divider"]}></div>
                )}

                {/* Alignment buttons */}
                {type === "rich" &&
                    formatButtons
                        .filter((button) => button.type === "align")
                        .map((button) => (
                            <button
                                key={button.command}
                                type="button"
                                className={styles["toolbar-btn"]}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => execCommand(button.command)}
                                title={button.title}
                            >
                                <img
                                    src={button.icon}
                                    alt={button.title}
                                    className={styles.buttonIcon}
                                />
                            </button>
                        ))}

                {type === "rich" && (
                    <div className={styles["toolbar-divider"]}></div>
                )}

                {/* Insert format block button */}
                {type === "rich" &&
                    formatButtons
                        .filter((button) => button.type === "block")
                        .map((button) => (
                            <button
                                key={button.command + button.title}
                                type="button"
                                className={styles["toolbar-btn"]}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                    execCommand(button.command, button.title)
                                }
                                title={button.title}
                            >
                                <img
                                    src={button.icon}
                                    alt={button.title}
                                    className={styles.buttonIcon}
                                />
                            </button>
                        ))}
                {/* Insert Image button */}
                {type === "rich" && (
                    <button
                        type="button"
                        className={styles["toolbar-btn"]}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("insertImage")}
                        title="Chèn hình ảnh"
                    >
                        <img
                            src={icons.imageIcon}
                            alt="Chèn hình ảnh"
                            className={styles.buttonIcon}
                        />
                    </button>
                )}
                {type === "rich" && (
                    <button
                        type="button"
                        className={styles["toolbar-btn"]}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("createLink")}
                        title="Chèn liên kết"
                    >
                        <img
                            src={icons.linkIcon}
                            alt="Chèn liên kết"
                            className={styles.buttonIcon}
                        />
                    </button>
                )}

                <button
                    type="button"
                    className={styles["toolbar-btn"]}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => execCommand("removeFormat")}
                    title="Xóa định dạng"
                >
                    <img
                        src={icons.eraser}
                        alt="Xóa định dạng"
                        className={styles.buttonIcon}
                    />
                </button>
            </div>
            {/* Editor Content */}
            <div
                ref={editorRef}
                className={`${styles["editor-content"]} ${
                    isEditing ? styles.editing : ""
                }`}
                contentEditable={true}
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleClick}
                onKeyDown={(e) => {
                    // Cho phép ctrl/cmd + click để chỉnh sửa link
                    if (e.ctrlKey || e.metaKey) {
                        e.stopPropagation();
                    }
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};

export default TextEditor;
