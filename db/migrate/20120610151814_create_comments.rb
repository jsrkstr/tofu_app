class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.string :content
      t.integer :author_id
      t.string :recipient_ids
      t.string :group
      t.integer :tofu_id
      t.string :updated_at
      t.string :created_at

      t.timestamps
    end
  end
end
