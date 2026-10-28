import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import {
  X,
  PlusCircle,
  Edit3,
  DollarSign,
  Tag,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  description: '',
  price: '',
  category: 'Development',
};

const CATEGORIES = [
  'Development',
  'Design',
  'Marketing',
  'Writing',
];

const CreateGigModal = ({
  isOpen,
  onClose,
  onGigSaved,
  editingGig,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingGig);

  //Keep the form in sync with create and edit modes
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editingGig) {
      setFormData({
        title: editingGig.title || '',
        description: editingGig.description || '',
        price:
          editingGig.price !== undefined && editingGig.price !== null
            ? String(editingGig.price)
            : '',
        category: editingGig.category || 'Development',
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setError('');
  }, [isOpen, editingGig]);

  //Update the matching form field as the user types
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  //Do not close the modal while a request is running
  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setError('');
    onClose();
  };

  //Catch common form mistakes before hitting the API
  const validateForm = () => {
    const title = formData.title.trim();
    const description = formData.description.trim();
    const numericPrice = Number(formData.price);

    if (!title) {
      return 'Please enter a title for your gig.';
    }

    if (title.length < 3) {
      return 'The gig title must be at least 3 characters long.';
    }

    if (!description) {
      return 'Please enter a description for your gig.';
    }

    if (description.length < 10) {
      return 'The description must be at least 10 characters long.';
    }

    if (formData.price === '' || !Number.isFinite(numericPrice)) {
      return 'Please enter a valid price.';
    }

    if (numericPrice < 0) {
      return 'Price cannot be negative.';
    }

    if (!formData.category) {
      return 'Please select a category.';
    }

    return '';
  };

  //Create a new gig or update the existing one
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
    };

    try {
      let response;

      if (editingGig) {
        response = await API.put(
          `/services/${editingGig._id}`,
          payload,
        );
      } else {
        response = await API.post('/services', payload);
      }

      const savedGig =
        response.data?.service ||
        response.data?.data ||
        response.data;

      if (onGigSaved) {
        onGigSaved(savedGig);
      }

      onClose();
    } catch (err) {
      const data = err.response?.data;
      const validationMessages = Array.isArray(data?.errors)
        ? data.errors.map((e) => e.message).filter(Boolean)
        : [];
      const message = validationMessages.length
        ? validationMessages.join(' • ')
        : data?.message ||
          data?.error ||
          `Unable to ${isEditing ? 'update' : 'create'} the gig. Please try again.`;

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-gig-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="my-auto w-full max-w-2xl border-2 border-stone-900 bg-[#f7f5f0]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-stone-900 px-6 pb-4 pt-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-stone-900 bg-orange-700 text-white">
              {isEditing ? <Edit3 size={18} /> : <PlusCircle size={18} />}
            </div>

            <div>
              <h2
                id="create-gig-title"
                className="font-serif text-2xl leading-tight text-stone-900"
              >
                {isEditing ? 'Edit Your Gig' : 'Post a New Gig'}
              </h2>

              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-stone-500">
                {isEditing
                  ? 'Update your service details'
                  : 'Show clients what you can help with'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
          {error && (
            <div
              className="mb-5 flex items-start gap-3 border-l-2 border-orange-700 bg-orange-50 py-2.5 pl-3 pr-2 text-sm text-orange-900"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="gig-title"
                className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
              >
                Gig Title
              </label>

              <div className="relative">
                <FileText
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                />

                <input
                  id="gig-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. I will build a responsive React website"
                  maxLength={120}
                  disabled={isSubmitting}
                  className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="gig-category"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
                >
                  Category
                </label>

                <div className="relative">
                  <Tag
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                  />

                  <select
                    id="gig-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full appearance-none border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition focus:border-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="gig-price"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
                >
                  Price
                </label>

                <div className="relative">
                  <DollarSign
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                  />

                  <input
                    id="gig-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="50.00"
                    disabled={isSubmitting}
                    className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="gig-description"
                className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
              >
                Description
              </label>

              <textarea
                id="gig-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what clients will receive, what's included, and why they should choose your service..."
                rows={6}
                maxLength={2000}
                disabled={isSubmitting}
                className="w-full resize-y border-2 border-stone-900 bg-white px-3 py-2.5 text-sm leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1.5 text-right font-mono text-[10px] uppercase tracking-widest text-stone-400">
                {formData.description.length}/2000
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t-2 border-stone-900 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-2 border-stone-300 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-stone-600 transition hover:border-stone-900 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 border-2 border-stone-900 bg-stone-900 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {isEditing ? 'Saving' : 'Publishing'}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Edit3 size={14} />
                  ) : (
                    <PlusCircle size={14} />
                  )}
                  {isEditing ? 'Save Changes' : 'Publish Gig'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGigModal;