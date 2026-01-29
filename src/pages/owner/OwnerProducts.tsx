import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Filter
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductModal } from '@/components/modals/ProductModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { mockProducts } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  inStock: boolean;
}

export default function OwnerProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>(mockProducts as Product[]);
  
  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = products.filter(p => !p.inStock).length;

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (productData.id) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === productData.id ? { ...productData, id: productData.id } as Product : p
      ));
      toast.success('Бараа амжилттай шинэчлэгдлээ');
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: `product-${Date.now()}`,
      };
      setProducts(prev => [...prev, newProduct]);
      toast.success('Шинэ бараа амжилттай нэмэгдлээ');
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      toast.success('Бараа амжилттай устгагдлаа');
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border pt-safe px-4 pb-4">
        <div className="pt-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Бүтээгдэхүүн</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {products.length} бүтээгдэхүүн • {inStockCount} нөөцтэй
              </p>
            </div>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Нэмэх
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Бараа хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted border-0"
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <span className="text-xl font-bold text-foreground">{products.length}</span>
            <p className="text-xs text-muted-foreground">Нийт бараа</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <span className="text-xl font-bold text-success">{inStockCount}</span>
            <p className="text-xs text-muted-foreground">Нөөцтэй</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-3 text-center">
            <span className="text-xl font-bold text-destructive">{outOfStockCount}</span>
            <p className="text-xs text-muted-foreground">Дууссан</p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'secondary'}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Бүгд' : category}
            </Badge>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.03 * index }}
              className="bg-card rounded-2xl overflow-hidden shadow-card group"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button 
                    size="icon-sm" 
                    variant="secondary"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon-sm" 
                    variant="destructive"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className={cn(
                  "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
                  product.inStock 
                    ? "bg-success text-success-foreground" 
                    : "bg-destructive text-destructive-foreground"
                )}>
                  {product.inStock ? 'Нөөцтэй' : 'Дууссан'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary">{product.price.toLocaleString()}₮</span>
                    <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Бараа олдсонгүй</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Хайлтад тохирох бараа байхгүй байна
            </p>
          </div>
        )}
      </section>

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Бараа устгах"
        description={`"${selectedProduct?.name}" барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
