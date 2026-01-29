import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories, addCategory } from '../../https';
import { enqueueSnackbar } from 'notistack';
import Modal from '../ui/Modal';

import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../../redux/slices/appSlice';
import { FaSearch, FaTrash, FaPen } from 'react-icons/fa';

const ProductGrid = ({ onAddToCart }) => {
    const [selectedCategory, setSelectedCategory] = useState(null); // ID or 'HOT_DEALS'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isHotDealCreation, setIsHotDealCreation] = useState(false);

    const searchQuery = useSelector((state) => state.app.searchQuery);
    const dispatch = useDispatch();

    // Forms State
    const [newItem, setNewItem] = useState({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
    const [editingProduct, setEditingProduct] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("");

    const queryClient = useQueryClient();

    // Data Fetching
    const { data: productsData, isLoading: productsLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

    const products = productsData?.data?.data || [];
    const categories = categoriesData?.data?.data || [];

    // Mutations
    const addProductMutation = useMutation({
        mutationFn: addProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Product added', { variant: 'success' });
            setIsAddModalOpen(false);
            setIsHotDealCreation(false);
            setNewItem({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
        },
        onError: () => enqueueSnackbar('Failed to add product', { variant: 'error' })
    });

    const updateProductMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Product updated', { variant: 'success' });
            setIsAddModalOpen(false);
            setEditingProduct(null);
            setIsHotDealCreation(false);
            setNewItem({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
        },
        onError: () => enqueueSnackbar('Failed to update product', { variant: 'error' })
    });

    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Product deleted', { variant: 'success' });
        },
        onError: () => enqueueSnackbar('Failed to delete product', { variant: 'error' })
    });

    const addCategoryMutation = useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            enqueueSnackbar('Category added', { variant: 'success' });
            setIsAddModalOpen(false);
            setNewCategoryName("");
            setNewCategoryIcon("");
        },
        onError: () => enqueueSnackbar('Failed to add category', { variant: 'error' })
    });

    // Formatting
    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (selectedCategory) {
            if (editingProduct) {
                updateProductMutation.mutate({
                    productId: editingProduct._id,
                    ...newItem,
                    category_id: selectedCategory === 'HOT_DEALS' ? undefined : selectedCategory._id,
                    price: Number(newItem.price),
                    isHotDeal: selectedCategory === 'HOT_DEALS' || newItem.isHotDeal
                });
            } else {
                addProductMutation.mutate({
                    ...newItem,
                    category_id: selectedCategory === 'HOT_DEALS' ? undefined : selectedCategory._id,
                    price: Number(newItem.price),
                    isHotDeal: selectedCategory === 'HOT_DEALS'
                });
            }
        } else {
            // Add Category
            addCategoryMutation.mutate({ name: newCategoryName, icon: newCategoryIcon });
        }
    };

    // Filter Logic: Search > Category > All
    let filteredProducts = products;
    if (searchQuery) {
        filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else if (selectedCategory === 'HOT_DEALS') {
        filteredProducts = products.filter(p => p.isHotDeal);
    } else if (selectedCategory) {
        filteredProducts = products.filter(p =>
            p.category_id === selectedCategory._id || p.category_id?._id === selectedCategory._id
        );
    }

    const getProductIcon = (product) => {
        if (product.image_url) return <img src={product.image_url} alt="" className="w-full h-full object-cover" />;

        let catId = typeof product.category_id === 'object' ? product.category_id?._id : product.category_id;
        const category = categories.find(c => c._id === catId);

        if (category && category.icon) return <span className="text-3xl">{category.icon}</span>;

        // Fallback based on name
        const name = product.name.toLowerCase();
        if (name.includes('pizza')) return <span className="text-3xl">🍕</span>;
        if (name.includes('burger')) return <span className="text-3xl">🍔</span>;
        if (name.includes('drink') || name.includes('coke') || name.includes('pepsi')) return <span className="text-3xl">🥤</span>;
        if (name.includes('fries')) return <span className="text-3xl">🍟</span>;

        if (product.isHotDeal) return <span className="text-3xl">🔥</span>;
        return <span className="text-3xl">📦</span>;
    };

    const handleEditClick = (e, product) => {
        e.stopPropagation();
        setEditingProduct(product);
        setNewItem({
            name: product.name,
            price: product.price,
            image_url: product.image_url || '',
            specifications: product.specifications || []
        });
        // Ensure we switch to the category of the product being edited if not already selected
        if (!selectedCategory) {
            if (product.isHotDeal) {
                setSelectedCategory('HOT_DEALS');
            } else {
                const catId = typeof product.category_id === 'object' ? product.category_id?._id : product.category_id;
                const cat = categories.find(c => c._id === catId);
                if (cat) setSelectedCategory(cat);
            }
        }
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (e, product) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            deleteProductMutation.mutate(product._id);
        }
    };

    if (productsLoading || categoriesLoading) return <div className="text-white p-6">Loading resources...</div>;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] relative overflow-hidden">
            {/* Header / Actions */}
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#141414] gap-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 items-center">
                    {/* Search Bar */}
                    <div className="relative min-w-[200px] max-w-[300px] mr-2">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
                        <input
                            type="text"
                            placeholder="Search Items..."
                            className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg pl-8 pr-4 py-2 text-xs text-white focus:border-orange-500 outline-none transition-all placeholder-gray-600"
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        />
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2"></div>

                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${!selectedCategory ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        All Items
                    </button>

                    <button
                        onClick={() => setSelectedCategory('HOT_DEALS')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${selectedCategory === 'HOT_DEALS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <span className="text-sm">🔥</span>
                        Hot Deals
                    </button>

                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${selectedCategory?._id === cat._id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {cat.icon && <span className="text-sm">{cat.icon}</span>}
                            {cat.name}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => {
                        setIsHotDealCreation(selectedCategory === 'HOT_DEALS');
                        setIsAddModalOpen(true);
                    }}
                    className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl"
                >
                    {selectedCategory === 'HOT_DEALS' ? '+ Add Hot Deal' : (selectedCategory ? '+ Add Product' : '+ Add Category')}
                </button>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[#0a0a0a]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div
                            key={product._id}
                            onClick={() => onAddToCart(product)}
                            className="bg-[#1c1c1c] border border-white/5 rounded-3xl hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col overflow-hidden relative shadow-xl hover:shadow-orange-500/10 min-h-[10rem] h-auto"
                        >
                            {/* Card Content */}
                            <div className="flex flex-row p-5 gap-6 items-center h-full">
                                {/* Thumbnail */}
                                <div className="w-28 h-28 bg-[#242424] rounded-2xl shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                                    {getProductIcon(product)}
                                </div>
                                {/* Info */}
                                <div className="flex flex-col min-w-0 flex-1 justify-center py-2">
                                    <h4 className="text-gray-100 font-black text-lg leading-snug mb-2 group-hover:text-orange-500 transition-colors break-words">
                                        {product.name}
                                    </h4>
                                    <span className="text-orange-500 font-mono font-black text-2xl tracking-tighter">
                                        PKR {product.price}
                                    </span>
                                </div>
                                {product.isHotDeal && (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-red-600 text-[10px] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg border border-white/10">HOT DEAL</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions Overlay - Visible on Hover */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
                                <button
                                    onClick={(e) => handleEditClick(e, product)}
                                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-xl transition-all hover:scale-110"
                                    title="Edit"
                                >
                                    <FaPen size={14} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, product)}
                                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-500 shadow-xl transition-all hover:scale-110"
                                    title="Delete"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center opacity-30">
                            <p className="text-xs uppercase font-bold tracking-widest">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                    setIsHotDealCreation(false);
                    setNewItem({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
                }}
                title={selectedCategory === 'HOT_DEALS' ? (editingProduct ? 'Edit Hot Deal' : 'New Hot Deal') : (selectedCategory ? (editingProduct ? 'Edit Product' : `Add to ${selectedCategory.name}`) : 'New Category')}
            >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    {selectedCategory ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Product Name</label>
                                <input
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                    placeholder="e.g. Zinger Burger"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Price (PKR)</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none font-mono"
                                    placeholder="0"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    required
                                />
                            </div>
                            {!isHotDealCreation && (
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Image URL</label>
                                    <input
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                        placeholder="https://..."
                                        value={newItem.image_url}
                                        onChange={e => setNewItem({ ...newItem, image_url: e.target.value })}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Category Name</label>
                                <input
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                    placeholder="e.g. Burgers"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Icon (Emoji or URL)</label>
                                <input
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                    placeholder="🍔"
                                    value={newCategoryIcon}
                                    onChange={e => setNewCategoryIcon(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-bold uppercase tracking-widest mt-4 shadow-lg transition-all">
                        {isHotDealCreation ? (editingProduct ? 'Update Hot Deal' : 'Save Hot Deal') : (selectedCategory ? (editingProduct ? 'Update Product' : 'Save Product') : 'Create Category')}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ProductGrid;
