import { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
    // ดึงค่าเดิมที่เคยบันทึกไว้ในเครื่อง ถ้าไม่มีให้ใช้ขนาดปกติ (text-sm)
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('global_font_size') || 'text-sm';
    });

    // ทุกครั้งที่เปลี่ยนขนาด ให้เซฟลงเครื่องไว้ด้วย เปิดเว็บมาใหม่จะได้ไม่ต้องกดเลือกอีกรอบครับพี่ชาย
    const changeFontSize = (size) => {
        setFontSize(size);
        localStorage.setItem('global_font_size', size);
    };

    // ตัวแปลงคลาสเพื่อให้สอดคล้องกับขนาดหลัก
    const getCls = (base) => {
        if (fontSize === 'text-xs') {
            if (base === 'title') return 'text-lg';
            if (base === 'sub') return 'text-[10px]';
            return 'text-xs';
        }
        if (fontSize === 'text-lg') {
            if (base === 'title') return 'text-3xl';
            if (base === 'sub') return 'text-sm';
            return 'text-lg';
        }
        // ขนาดปกติ (text-sm)
        if (base === 'title') return 'text-2xl';
        if (base === 'sub') return 'text-xs';
        return 'text-sm';
    };

    return (
        <FontSizeContext.Provider value={{ fontSize, changeFontSize, getCls }}>
            <div className={fontSize}>
                {children}
            </div>
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => useContext(FontSizeContext);