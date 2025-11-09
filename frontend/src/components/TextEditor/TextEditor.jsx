import React, { useRef, useState, useEffect } from "react";
import * as icons from "../../assets/icons";
import { convertImagesToAbsoluteUrls } from "@/utils";
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
    const [showVideoDialog, setShowVideoDialog] = useState(false);
    const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [videoError, setVideoError] = useState("");
    const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
    const [currentFontSize, setCurrentFontSize] = useState("16");

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Convert relative image URLs to absolute URLs before setting innerHTML
            const processedValue = convertImagesToAbsoluteUrls(value || "");
            editorRef.current.innerHTML = processedValue;
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

    // Effect để cập nhật cỡ chữ hiện tại khi selection thay đổi
    useEffect(() => {
        const handleSelectionChange = () => {
            if (type === "rich" && editorRef.current && document.activeElement === editorRef.current) {
                updateCurrentFontSize();
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [type]);

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

    const insertVideoFromUrl = (url) => {
        try {
            let embedCode = "";

            // YouTube
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                let videoId = "";
                if (url.includes("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1].split("?")[0];
                } else if (url.includes("youtube.com/watch?v=")) {
                    videoId = url.split("v=")[1].split("&")[0];
                } else if (url.includes("youtube.com/embed/")) {
                    videoId = url.split("embed/")[1].split("?")[0];
                }

                if (videoId) {
                    embedCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 10px 0;">
                        <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                            src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>`;
                }
            }
            // Vimeo
            else if (url.includes("vimeo.com")) {
                const videoId = url.split("vimeo.com/")[1].split("?")[0];
                if (videoId) {
                    embedCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 10px 0;">
                        <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                            src="https://player.vimeo.com/video/${videoId}" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>`;
                }
            }
            // Direct video URL
            else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                embedCode = `<video controls style="max-width: 100%; margin: 10px 0;">
                    <source src="${url}" type="video/${url.split(".").pop()}">
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>`;
            }
            // Generic iframe for other embeds
            else {
                embedCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 10px 0;">
                    <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                        src="${url}" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                </div>`;
            }

            if (embedCode) {
                const savedSel = saveSelection();
                document.execCommand("insertHTML", false, embedCode);
                handleInput();
                if (savedSel) {
                    setTimeout(() => {
                        restoreSelection(savedSel);
                    }, 0);
                }
                return true;
            } else {
                setVideoError(
                    "Không thể nhận dạng định dạng video. Vui lòng thử lại với URL hợp lệ."
                );
                return false;
            }
        } catch (error) {
            console.error("Error inserting video:", error);
            setVideoError("Có lỗi xảy ra khi chèn video. Vui lòng thử lại.");
            return false;
        }
    };

    const handleVideoFileUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Kiểm tra kích thước file (giới hạn 100MB)
                const maxSize = 100 * 1024 * 1024; // 100MB
                if (file.size > maxSize) {
                    setVideoError(
                        "Video quá lớn! Vui lòng chọn video nhỏ hơn 100MB."
                    );
                    return;
                }

                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const videoUrl = e.target.result;
                        const videoType = file.type;

                        const embedCode = `<video controls style="max-width: 100%; margin: 10px 0;">
                            <source src="${videoUrl}" type="${videoType}">
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>`;

                        const savedSel = saveSelection();
                        document.execCommand("insertHTML", false, embedCode);
                        handleInput();
                        if (savedSel) {
                            setTimeout(() => {
                                restoreSelection(savedSel);
                            }, 0);
                        }

                        // Đóng dialog
                        setShowVideoDialog(false);
                        setVideoError("");
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error("Error inserting video:", error);
                    setVideoError(
                        "Có lỗi xảy ra khi chèn video. Vui lòng thử lại."
                    );
                }
            }
        };
        input.click();
    };

    const handleVideoUrlSubmit = () => {
        if (!videoUrl.trim()) {
            setVideoError("Vui lòng nhập URL video");
            return;
        }

        const success = insertVideoFromUrl(videoUrl);
        if (success) {
            setShowVideoUrlInput(false);
            setShowVideoDialog(false);
            setVideoUrl("");
            setVideoError("");
        }
    };

    const handleVideoInsert = () => {
        setShowVideoDialog(true);
        setVideoError("");
    };

    // Hàm làm sạch HTML, chỉ giữ lại các định dạng được phép
    const sanitizeHTML = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Các thẻ được phép
        const allowedTags = type === "rich" 
            ? ['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'UL', 'OL', 'LI', 'A', 'BLOCKQUOTE', 'PRE', 'IMG', 'BR', 'P', 'DIV']
            : ['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'DIV'];

        // Các thuộc tính được phép
        const allowedAttributes = {
            'A': ['href', 'target'],
            'IMG': ['src', 'alt'],
        };

        const cleanNode = (node) => {
            if (node.nodeType === 3) { // Text node
                return node.cloneNode(true);
            }

            if (node.nodeType === 1) { // Element node
                const tagName = node.tagName.toUpperCase();
                
                // Các thẻ chứa inline styles cần loại bỏ hoàn toàn (SPAN, FONT, etc.)
                // Chỉ giữ lại nội dung text
                const inlineStyleTags = ['SPAN', 'FONT', 'MARK', 'SMALL', 'BIG'];
                if (inlineStyleTags.includes(tagName)) {
                    const fragment = document.createDocumentFragment();
                    Array.from(node.childNodes).forEach(child => {
                        const cleaned = cleanNode(child);
                        if (cleaned) fragment.appendChild(cleaned);
                    });
                    return fragment;
                }
                
                // Nếu thẻ không được phép, chỉ lấy nội dung text
                if (!allowedTags.includes(tagName)) {
                    const fragment = document.createDocumentFragment();
                    Array.from(node.childNodes).forEach(child => {
                        const cleaned = cleanNode(child);
                        if (cleaned) fragment.appendChild(cleaned);
                    });
                    return fragment;
                }

                // Tạo node mới sạch sẽ
                const newNode = document.createElement(tagName);
                
                // Chỉ giữ lại các thuộc tính được phép (href, src, alt)
                if (allowedAttributes[tagName]) {
                    allowedAttributes[tagName].forEach(attr => {
                        if (node.hasAttribute(attr)) {
                            newNode.setAttribute(attr, node.getAttribute(attr));
                        }
                    });
                }
                // KHÔNG copy các attributes khác: class, id, data-*, style (trừ text-align)

                // Loại bỏ TẤT CẢ inline styles (font-size, color, font-family, background, etc.)
                // CHỈ giữ lại text-align cho type "rich"
                if (type === "rich" && (tagName === 'P' || tagName === 'DIV')) {
                    const textAlign = node.style.textAlign;
                    if (textAlign && ['left', 'center', 'right', 'justify'].includes(textAlign)) {
                        newNode.style.textAlign = textAlign;
                    }
                }
                // Không copy bất kỳ style nào khác - để editor CSS tự quản lý font-size, font-family, color

                // Xử lý các node con
                Array.from(node.childNodes).forEach(child => {
                    const cleaned = cleanNode(child);
                    if (cleaned) newNode.appendChild(cleaned);
                });

                return newNode;
            }

            return null;
        };

        const fragment = document.createDocumentFragment();
        Array.from(temp.childNodes).forEach(child => {
            const cleaned = cleanNode(child);
            if (cleaned) fragment.appendChild(cleaned);
        });

        const result = document.createElement('div');
        result.appendChild(fragment);
        return result.innerHTML;
    };

    const handlePaste = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Lấy dữ liệu clipboard
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");

        // Chặn dán ảnh nếu không phải type "rich"
        if (type !== "rich") {
            const items = e.clipboardData.items;

            // Kiểm tra có file ảnh trong clipboard
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    return false;
                }
            }

            // Kiểm tra có img tag trong HTML clipboard
            if (html && html.includes("<img")) {
                return false;
            }
        }

        // Làm sạch và paste HTML
        let cleanHTML;
        if (html) {
            cleanHTML = sanitizeHTML(html);
        } else {
            // Nếu chỉ có plain text, giữ nguyên line breaks
            cleanHTML = text.replace(/\n/g, '<br>');
        }

        // Paste vào vị trí con trỏ
        const savedSel = saveSelection();
        document.execCommand('insertHTML', false, cleanHTML);
        handleInput();
        
        return false;
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

    // Hàm xử lý toggle danh sách (bấm lại để xóa)
    const handleListToggle = (command) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        let currentNode = range.commonAncestorContainer;
        
        // Tìm thẻ LI gần nhất
        let listItem = currentNode.nodeType === 3 
            ? currentNode.parentElement 
            : currentNode;
        
        while (listItem && listItem !== editorRef.current) {
            if (listItem.tagName === 'LI') break;
            listItem = listItem.parentElement;
        }

        // Nếu đang trong list item
        if (listItem && listItem.tagName === 'LI') {
            const list = listItem.parentElement;
            const isEmpty = !listItem.textContent.trim();

            // Nếu list item rỗng, xóa danh sách và tạo paragraph mới
            if (isEmpty) {
                const newP = document.createElement('p');
                newP.innerHTML = '<br>'; // Để giữ con trỏ
                
                // Nếu đây là item duy nhất, thay thế cả list
                if (list.children.length === 1) {
                    list.parentNode.replaceChild(newP, list);
                    
                    // Focus vào paragraph mới sau khi DOM cập nhật
                    setTimeout(() => {
                        const newRange = document.createRange();
                        newRange.setStart(newP, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        newP.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 0);
                } else {
                    // Nếu có nhiều items, chèn paragraph vào đúng vị trí của item hiện tại
                    // Thay vì insertBefore(newP, list), ta chèn vào vị trí trong list
                    const nextItem = listItem.nextElementSibling;
                    
                    // Xóa item hiện tại trước
                    listItem.remove();
                    
                    // Nếu còn items sau, chèn paragraph giữa list
                    if (nextItem) {
                        // Tách list thành 2 phần
                        const newList = list.cloneNode(false);
                        
                        // Di chuyển các items sau vào list mới
                        let currentItem = nextItem;
                        const itemsToMove = [];
                        while (currentItem) {
                            itemsToMove.push(currentItem);
                            currentItem = currentItem.nextElementSibling;
                        }
                        
                        itemsToMove.forEach(item => {
                            newList.appendChild(item);
                        });
                        
                        // Chèn: list cũ -> paragraph -> list mới
                        list.parentNode.insertBefore(newP, list.nextSibling);
                        list.parentNode.insertBefore(newList, newP.nextSibling);
                    } else {
                        // Nếu không có items sau, chỉ cần chèn paragraph sau list
                        list.parentNode.insertBefore(newP, list.nextSibling);
                    }
                    
                    // Focus vào paragraph mới
                    setTimeout(() => {
                        const newRange = document.createRange();
                        newRange.setStart(newP, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        newP.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 0);
                }
                
                handleInput();
                return;
            }
        }

        // Nếu không rỗng hoặc không trong list, thực hiện lệnh bình thường
        document.execCommand(command, false, null);
        handleInput();
    };

    // Hàm xóa định dạng tùy chỉnh
    const handleRemoveFormat = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        
        // Nếu không có text được chọn, return
        if (range.collapsed) {
            return;
        }

        // Lấy nội dung đã chọn
        const fragment = range.cloneContents();
        const temp = document.createElement('div');
        temp.appendChild(fragment);

        // Loại bỏ các thẻ định dạng nhưng giữ lại text
        const removeFormattingTags = (node) => {
            if (node.nodeType === 3) { // Text node
                return node.cloneNode(true);
            }

            if (node.nodeType === 1) { // Element node
                const tagName = node.tagName.toUpperCase();
                
                // Các thẻ cần giữ lại cấu trúc
                const structuralTags = ['BR', 'P', 'DIV'];
                
                if (structuralTags.includes(tagName)) {
                    const newNode = document.createElement(tagName);
                    Array.from(node.childNodes).forEach(child => {
                        const cleaned = removeFormattingTags(child);
                        if (cleaned) newNode.appendChild(cleaned);
                    });
                    return newNode;
                }
                
                // Các thẻ khác (B, I, U, A, etc.) - chỉ lấy nội dung
                const fragment = document.createDocumentFragment();
                Array.from(node.childNodes).forEach(child => {
                    const cleaned = removeFormattingTags(child);
                    if (cleaned) fragment.appendChild(cleaned);
                });
                return fragment;
            }

            return null;
        };

        const cleanedFragment = document.createDocumentFragment();
        Array.from(temp.childNodes).forEach(child => {
            const cleaned = removeFormattingTags(child);
            if (cleaned) cleanedFragment.appendChild(cleaned);
        });

        // Tạo HTML từ fragment đã làm sạch
        const cleanedDiv = document.createElement('div');
        cleanedDiv.appendChild(cleanedFragment.cloneNode(true));
        const cleanedHTML = cleanedDiv.innerHTML;

        // Xóa nội dung cũ và chèn nội dung mới
        range.deleteContents();
        
        // Sử dụng insertHTML để giữ cấu trúc
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedHTML;
        
        while (tempDiv.firstChild) {
            range.insertNode(tempDiv.lastChild);
        }
        
        // Cập nhật selection
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleInput();
    };

    const execCommand = (command, value = null) => {
        try {
            if (editorRef.current) {
                editorRef.current.focus();

                if (command === "insertImage") {
                    handleImageInsert();
                    return;
                }

                if (command === "insertVideo") {
                    handleVideoInsert();
                    return;
                }

                if (command === "createLink") {
                    handleLinkInsert();
                    return;
                }

                if (command === "removeFormat") {
                    handleRemoveFormat();
                    return;
                }

                if (command === "insertUnorderedList" || command === "insertOrderedList") {
                    handleListToggle(command);
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

    // Hàm thay đổi cỡ chữ
    const changeFontSize = (size) => {
        try {
            if (editorRef.current) {
                editorRef.current.focus();
                
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();
                
                // Lưu selection để có thể restore sau
                const savedSel = saveSelection();
                
                if (selectedText) {
                    // Có text được chọn - wrap trong span
                    const span = document.createElement('span');
                    span.style.fontSize = size;
                    
                    try {
                        range.surroundContents(span);
                    } catch (e) {
                        // Nếu surroundContents thất bại (do selection phức tạp)
                        const fragment = range.extractContents();
                        span.appendChild(fragment);
                        range.insertNode(span);
                    }
                    
                    // Di chuyển cursor ra khỏi span
                    range.setStartAfter(span);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Trigger input event để lưu vào undo history
                    setTimeout(() => {
                        handleInput();
                    }, 0);
                } else {
                    // Không có text được chọn - tạo span rỗng với zero-width space
                    // để text tiếp theo có cỡ chữ này
                    const span = document.createElement('span');
                    span.style.fontSize = size;
                    // Thêm zero-width space để span không bị collapse
                    span.innerHTML = '&#8203;';
                    
                    range.insertNode(span);
                    
                    // Đặt cursor vào trong span
                    range.setStart(span.firstChild, 1);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Trigger input event
                    setTimeout(() => {
                        handleInput();
                    }, 0);
                }
                
                setCurrentFontSize(size.replace('px', ''));
                setShowFontSizeDropdown(false);
            }
        } catch (error) {
            console.error("Error changing font size:", error);
        }
    };

    // Hàm cập nhật cỡ chữ hiện tại dựa trên vị trí con trỏ
    const updateCurrentFontSize = () => {
        try {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            let node = selection.anchorNode;
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentNode;
            }
            
            // Tìm cỡ chữ từ element hoặc parent elements
            let fontSize = '16'; // Default
            let currentNode = node;
            
            while (currentNode && currentNode !== editorRef.current) {
                if (currentNode.style && currentNode.style.fontSize) {
                    fontSize = currentNode.style.fontSize.replace('px', '');
                    break;
                }
                const computedStyle = window.getComputedStyle(currentNode);
                if (computedStyle.fontSize) {
                    fontSize = Math.round(parseFloat(computedStyle.fontSize)).toString();
                    break;
                }
                currentNode = currentNode.parentNode;
            }
            
            setCurrentFontSize(fontSize);
        } catch (error) {
            console.error("Error updating font size:", error);
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

    // Hàm xử lý phím trong editor
    const handleKeyDown = (e) => {
        // Cho phép ctrl/cmd + click để chỉnh sửa link
        if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
        }

        // Xử lý phím Tab - Tạo khoảng cách indent
        if (e.key === 'Tab') {
            e.preventDefault();
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const isCollapsed = range.collapsed; // Kiểm tra có text được chọn không
            
            // Kiểm tra xem có đang trong list không
            let currentNode = range.commonAncestorContainer;
            let listItem = currentNode.nodeType === 3 
                ? currentNode.parentElement 
                : currentNode;
            
            while (listItem && listItem !== editorRef.current) {
                if (listItem.tagName === 'LI') break;
                listItem = listItem.parentElement;
            }

            if (listItem && listItem.tagName === 'LI') {
                // Đang trong list item
                const list = listItem.parentElement;
                
                // Nếu có nhiều list items được chọn, indent/outdent tất cả
                if (!isCollapsed) {
                    // Lấy tất cả các list items trong selection
                    const selectedItems = [];
                    const startContainer = range.startContainer;
                    const endContainer = range.endContainer;
                    
                    // Tìm tất cả các LI items trong range
                    let currentItem = listItem;
                    const allItems = Array.from(list.children);
                    const startIndex = allItems.indexOf(currentItem);
                    
                    // Tìm end item
                    let endItem = endContainer.nodeType === 3 
                        ? endContainer.parentElement 
                        : endContainer;
                    while (endItem && endItem !== editorRef.current) {
                        if (endItem.tagName === 'LI') break;
                        endItem = endItem.parentElement;
                    }
                    
                    const endIndex = endItem ? allItems.indexOf(endItem) : startIndex;
                    
                    // Lấy tất cả items từ start đến end
                    for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
                        if (i >= 0 && i < allItems.length) {
                            selectedItems.push(allItems[i]);
                        }
                    }
                    
                    // Indent hoặc outdent tất cả selected items
                    if (e.shiftKey) {
                        // Shift + Tab: Outdent tất cả
                        selectedItems.forEach(item => {
                            const itemList = item.parentElement;
                            const parentList = itemList.parentElement;
                            if (parentList && (parentList.tagName === 'UL' || parentList.tagName === 'OL')) {
                                const parentItem = itemList.parentElement.closest('li');
                                if (parentItem) {
                                    const parentListContainer = parentItem.parentElement;
                                    parentListContainer.insertBefore(item, parentItem.nextSibling);
                                }
                            }
                        });
                        
                        // Cleanup empty lists
                        selectedItems.forEach(item => {
                            const emptyLists = editorRef.current.querySelectorAll('ul:empty, ol:empty');
                            emptyLists.forEach(el => el.remove());
                        });
                    } else {
                        // Tab: Indent tất cả (từ dưới lên để tránh lỗi)
                        for (let i = selectedItems.length - 1; i >= 0; i--) {
                            const item = selectedItems[i];
                            const prevItem = item.previousElementSibling;
                            if (prevItem && prevItem.tagName === 'LI') {
                                let subList = prevItem.querySelector(':scope > ul, :scope > ol');
                                if (!subList) {
                                    subList = document.createElement(list.tagName);
                                    prevItem.appendChild(subList);
                                }
                                subList.appendChild(item);
                            }
                        }
                    }
                } else {
                    // Chỉ một item - logic cũ
                    if (e.shiftKey) {
                        // Shift + Tab: Giảm indent (outdent)
                        const parentList = list.parentElement;
                        if (parentList && (parentList.tagName === 'UL' || parentList.tagName === 'OL')) {
                            const parentItem = list.parentElement.closest('li');
                            if (parentItem) {
                                const parentListContainer = parentItem.parentElement;
                                parentListContainer.insertBefore(listItem, parentItem.nextSibling);
                                
                                if (list.children.length === 0) {
                                    list.remove();
                                }
                            }
                        }
                    } else {
                        // Tab: Tăng indent
                        const prevItem = listItem.previousElementSibling;
                        if (prevItem && prevItem.tagName === 'LI') {
                            let subList = prevItem.querySelector(':scope > ul, :scope > ol');
                            if (!subList) {
                                subList = document.createElement(list.tagName);
                                prevItem.appendChild(subList);
                            }
                            subList.appendChild(listItem);
                        }
                    }
                }
            } else {
                // Không trong list
                if (!isCollapsed) {
                    // Có text được chọn - Indent/outdent từng dòng
                    const selectedContent = range.cloneContents();
                    const tempDiv = document.createElement('div');
                    tempDiv.appendChild(selectedContent);
                    
                    // Lấy HTML của selection
                    let html = range.toString();
                    const lines = html.split('\n');
                    
                    if (lines.length > 1 || html.includes('\n')) {
                        // Có nhiều dòng được chọn
                        const tabSpaces = '\u00A0\u00A0\u00A0\u00A0';
                        
                        if (e.shiftKey) {
                            // Shift + Tab: Xóa indent
                            const indentedHtml = lines.map(line => {
                                // Xóa 4 spaces đầu tiên nếu có
                                return line.replace(/^(\u00A0{1,4}|\s{1,4})/, '');
                            }).join('\n');
                            
                            document.execCommand('insertText', false, indentedHtml);
                        } else {
                            // Tab: Thêm indent cho mỗi dòng
                            const indentedHtml = lines.map(line => tabSpaces + line).join('\n');
                            document.execCommand('insertText', false, indentedHtml);
                        }
                    } else {
                        // Chỉ 1 dòng, chèn tab bình thường
                        if (!e.shiftKey) {
                            document.execCommand('insertText', false, tabSpaces);
                        }
                    }
                } else {
                    // Không có text được chọn, chèn tab spaces
                    const tabSpaces = '\u00A0\u00A0\u00A0\u00A0';
                    document.execCommand('insertText', false, tabSpaces);
                }
            }
            
            handleInput();
            return;
        }

        // Xử lý Backspace và Delete trong list item rỗng
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            let currentNode = range.commonAncestorContainer;
            
            // Tìm thẻ LI gần nhất
            let listItem = currentNode.nodeType === 3 
                ? currentNode.parentElement 
                : currentNode;
            
            while (listItem && listItem !== editorRef.current) {
                if (listItem.tagName === 'LI') break;
                listItem = listItem.parentElement;
            }

            // Nếu đang trong list item rỗng
            if (listItem && listItem.tagName === 'LI') {
                const isEmpty = !listItem.textContent.trim();
                
                // Kiểm tra con trỏ ở đầu list item
                const isAtStart = range.startOffset === 0 && 
                    (range.startContainer === listItem || 
                     range.startContainer.parentElement === listItem);

                // Nếu list item rỗng HOẶC (có nội dung nhưng con trỏ ở đầu và bấm Backspace)
                if (isEmpty || (isAtStart && e.key === 'Backspace')) {
                    e.preventDefault();
                    
                    const list = listItem.parentElement;
                    const newP = document.createElement('p');
                    
                    // Giữ lại nội dung nếu có
                    if (!isEmpty) {
                        newP.innerHTML = listItem.innerHTML;
                    } else {
                        newP.innerHTML = '<br>'; // Để giữ con trỏ
                    }
                    
                    // Nếu đây là item duy nhất, thay thế cả list
                    if (list.children.length === 1) {
                        list.parentNode.replaceChild(newP, list);
                        
                        // Focus vào paragraph mới sau khi DOM cập nhật
                        setTimeout(() => {
                            const newRange = document.createRange();
                            newRange.setStart(newP, 0);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                            newP.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 0);
                    } else {
                        // Nếu có nhiều items, chèn paragraph vào đúng vị trí
                        const nextItem = listItem.nextElementSibling;
                        
                        // Xóa item hiện tại trước
                        listItem.remove();
                        
                        // Nếu còn items sau, chèn paragraph giữa list
                        if (nextItem) {
                            // Tách list thành 2 phần
                            const newList = list.cloneNode(false);
                            
                            // Di chuyển các items sau vào list mới
                            let currentItem = nextItem;
                            const itemsToMove = [];
                            while (currentItem) {
                                itemsToMove.push(currentItem);
                                currentItem = currentItem.nextElementSibling;
                            }
                            
                            itemsToMove.forEach(item => {
                                newList.appendChild(item);
                            });
                            
                            // Chèn: list cũ -> paragraph -> list mới
                            list.parentNode.insertBefore(newP, list.nextSibling);
                            list.parentNode.insertBefore(newList, newP.nextSibling);
                        } else {
                            // Nếu không có items sau, chỉ cần chèn paragraph sau list
                            list.parentNode.insertBefore(newP, list.nextSibling);
                        }
                        
                        // Focus vào paragraph mới
                        setTimeout(() => {
                            const newRange = document.createRange();
                            newRange.setStart(newP, 0);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                            newP.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 0);
                    }
                    
                    handleInput();
                    return;
                }
            }
        }
    };

    return (
        <div
            className={`${styles["text-editor"]} ${error ? styles.error : ""} ${
                isActive ? styles.active : ""
            } ${type === "rich" ? styles["rich"] : ""}`}
        >
            <div className={styles["text-editor-toolbar"]}>
                {/* Font Size Dropdown */}
                {type === "rich" && (
                    <div className={styles["font-size-container"]}>
                        <button
                            type="button"
                            className={styles["toolbar-btn"]}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
                            title="Cỡ chữ"
                        >
                            <span className={styles["font-size-value"]}>{currentFontSize}</span>
                            <span className={styles["dropdown-arrow"]}>▼</span>
                        </button>
                        {showFontSizeDropdown && (
                            <div className={styles["font-size-dropdown"]}>
                                <div 
                                    className={styles["font-size-option"]}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => changeFontSize('12px')}
                                >
                                    12
                                </div>
                                <div 
                                    className={styles["font-size-option"]}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => changeFontSize('14px')}
                                >
                                    14
                                </div>
                                <div 
                                    className={styles["font-size-option"]}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => changeFontSize('16px')}
                                >
                                    16
                                </div>
                                <div 
                                    className={styles["font-size-option"]}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => changeFontSize('18px')}
                                >
                                    18
                                </div>
                                <div 
                                    className={styles["font-size-option"]}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => changeFontSize('20px')}
                                >
                                    20
                                </div>
                                <div 
                                    className={styles["font-size-option"]}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => changeFontSize('24px')}
                                >
                                    24
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {type === "rich" && (
                    <div className={styles["toolbar-divider"]}></div>
                )}

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
                {/* Insert Video button */}
                {/* {type === "rich" && (
                    <button
                        type="button"
                        className={styles["toolbar-btn"]}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("insertVideo")}
                        title="Chèn video"
                    >
                        <img
                            src={icons.videoIcon}
                            alt="Chèn video"
                            className={styles.buttonIcon}
                        />
                    </button>
                )} */}
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
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />

            {/* Video Dialog */}
            {showVideoDialog && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        setShowVideoDialog(false);
                        setShowVideoUrlInput(false);
                        setVideoUrl("");
                        setVideoError("");
                    }}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!showVideoUrlInput ? (
                            <>
                                <h3 className={styles.modalTitle}>
                                    Chèn video
                                </h3>
                                <p className={styles.modalDescription}>
                                    Chọn cách chèn video vào bài viết
                                </p>
                                {videoError && (
                                    <div className={styles.errorMessage}>
                                        {videoError}
                                    </div>
                                )}
                                <div className={styles.modalButtons}>
                                    <button
                                        type="button"
                                        className={styles.modalButton}
                                        onClick={handleVideoFileUpload}
                                    >
                                        📁 Tải video từ máy
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.modalButton}
                                        onClick={() => {
                                            setShowVideoUrlInput(true);
                                            setVideoError("");
                                        }}
                                    >
                                        🔗 Nhập link video
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className={styles.modalCloseButton}
                                    onClick={() => {
                                        setShowVideoDialog(false);
                                        setVideoError("");
                                    }}
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className={styles.modalTitle}>
                                    Nhập URL video
                                </h3>
                                <p className={styles.modalDescription}>
                                    YouTube, Vimeo, hoặc link video trực tiếp
                                </p>
                                <input
                                    type="text"
                                    className={styles.modalInput}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={videoUrl}
                                    onChange={(e) => {
                                        setVideoUrl(e.target.value);
                                        setVideoError("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleVideoUrlSubmit();
                                        }
                                    }}
                                    autoFocus
                                />
                                {videoError && (
                                    <div className={styles.errorMessage}>
                                        {videoError}
                                    </div>
                                )}
                                <div className={styles.modalButtons}>
                                    <button
                                        type="button"
                                        className={styles.modalButton}
                                        onClick={handleVideoUrlSubmit}
                                    >
                                        Chèn video
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.modalCloseButton}
                                        onClick={() => {
                                            setShowVideoUrlInput(false);
                                            setVideoUrl("");
                                            setVideoError("");
                                        }}
                                    >
                                        Quay lại
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextEditor;
