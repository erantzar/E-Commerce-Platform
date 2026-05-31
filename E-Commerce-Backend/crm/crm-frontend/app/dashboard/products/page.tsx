// app/dashboard/products/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { fetchProducts, addProduct, updateProductAction, removeProduct } from "@/features/products/productSlice";
import { IProduct } from "@/shared/product.types";
import { toast } from "react-toastify";

export default function AddAndManageProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // משיכת הנתונים מהסטייט
  const { products, isLoading, error } = useSelector((state: RootState) => state.products);

  // סטייט עבור טופס ההוספה
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "electronics",
    stock: 0,
    isActive: true,
    images: [
      "https://example.com/images/iphone15-front.jpg",
      "https://example.com/images/iphone15-back.jpg"
    ]
  });

  // סטייט לניהול חלון עריכה צף (Modal)
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [editFormData, setEditFormData] = useState({
    price: 0,
    stock: 0,
    description: ""
  });

  // טעינת המוצרים כשהדף עולה
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // שליחת טופס הוספה (POST)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const result = await dispatch(addProduct(formData));
    if (addProduct.fulfilled.match(result)) {
      toast.success("המוצר נוסף בהצלחה!");
      // איפוס הטופס
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "electronics",
        stock: 0,
        isActive: true,
        images: ["https://example.com/images/iphone15-front.jpg"]
      });
    }
  };

  // פתיחת מצב עריכה עבור מוצר ספציפי
  const startEdit = (product: IProduct) => {
    setEditingProduct(product);
    setEditFormData({
      price: product.price,
      stock: product.stock,
      description: product.description || ""
    });
  };

  // שליחת עדכון מוצר (PUT)
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?._id) return;

    const result = await dispatch(updateProductAction({
      id: editingProduct._id,
      updateData: editFormData
    }));

    if (updateProductAction.fulfilled.match(result)) {
      toast.success("המוצר עודכן בהצלחה!");
      setEditingProduct(null); // סגירת חלון העריכה
    }
  };

  // מחיקת מוצר (DELETE)
  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    if (confirm("האם את בטוחה שברצונך למחוק מוצר זה מהשרת?")) {
      dispatch(removeProduct(id));
      toast.success("המוצר נמחק");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8" dir="rtl">
      
      {/* 1. טופס הוספת מוצר חדש */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">הוספת מוצר חדש לשרת</h1>
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">שם המוצר:</label>
            <input
              type="text" required placeholder="iPhone 15 Pro" className="w-full p-2 border rounded text-sm"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">מחיר ($):</label>
            <input
              type="number" required min={1} className="w-full p-2 border rounded text-sm"
              value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">מלאי:</label>
            <input
              type="number" required min={0} className="w-full p-2 border rounded text-sm"
              value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600 block mb-1">תיאור המוצר:</label>
            <textarea
              placeholder="Latest Apple smartphone with titanium frame..." className="w-full p-2 border rounded text-sm h-16"
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? "שומר..." : "+ הוסף מוצר"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. טבלת מציגת המוצרים הקיימים */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">מוצרים קיימים במערכת</h2>
        
        {error && <p className="text-red-500 font-semibold mb-2">שגיאה: {error}</p>}
        {isLoading && products.length === 0 && <p className="text-gray-500">טוען רשימת מוצרים...</p>}

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-right">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="p-3">שם המוצר</th>
                  <th className="p-3">מחיר</th>
                  <th className="p-3">מלאי</th>
                  <th className="p-3">תיאור</th>
                  <th className="p-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                {products.map((product: IProduct) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{product.name}</td>
                    <td className="p-3 font-semibold">${product.price}</td>
                    <td className="p-3">{product.stock} יחידות</td>
                    <td className="p-3 max-w-xs truncate">{product.description || "אין תיאור"}</td>
                    <td className="p-3 flex justify-center gap-3">
                      <button onClick={() => startEdit(product)} className="text-blue-600 hover:underline font-medium">
                        ערוך
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:underline font-medium">
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !isLoading && <p className="text-gray-500">לא נמצאו מוצרים בשרת.</p>
        )}
      </div>

      {/* 3. חלון צף (Modal) לעדכון מוצר - מופעל רק בלחיצה על ערוך */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" dir="rtl">
            <h3 className="text-base font-bold text-gray-900 mb-4">עדכון מוצר: {editingProduct.name}</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">מחיר חדש ($):</label>
                <input
                  type="number" required className="w-full p-2 border rounded text-sm"
                  value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">מלאי מעודכן:</label>
                <input
                  type="number" required className="w-full p-2 border rounded text-sm"
                  value={editFormData.stock} onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">תיאור מעודכן:</label>
                <textarea
                  className="w-full p-2 border rounded text-sm h-20"
                  value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700">
                  שמור שינויים
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-300">
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}