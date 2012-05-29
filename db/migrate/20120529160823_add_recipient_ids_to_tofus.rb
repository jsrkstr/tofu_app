class AddRecipientIdsToTofus < ActiveRecord::Migration
  def change
  	add_column :tofus, :recipient_ids, :string
  end
end
