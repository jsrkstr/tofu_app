class CreateReciepts < ActiveRecord::Migration
  def change
    create_table :reciepts do |t|
      t.integer :tofu_id
      t.integer :recipient_id

      t.timestamps
    end
    add_index :reciepts, [:tofu_id, :recipient_id]
  end
end
